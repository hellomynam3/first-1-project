// API Service
// Roles: Handles fetching data from external sources (JSON files or real APIs)

import { appSettings } from './store.js';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

async function finnhub(path, params = {}) {
    const key = appSettings.finnhubKey.trim();
    if (!key) throw new Error('Market data API key is not configured');
    const url = new URL(FINNHUB_BASE_URL + path);
    for (const [name, value] of Object.entries({ ...params, token: key })) {
        url.searchParams.set(name, String(value));
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Market data request failed: ' + response.status);
    return response.json();
}

function validQuote(quote) {
    return Number.isFinite(quote?.c) && quote.c > 0 && Number.isFinite(quote?.t) && quote.t > 0;
}

function buildStock(symbol, quote, profile = {}, metrics = {}) {
    const m = metrics.metric || {};
    return {
        symbol,
        name: profile.name || symbol,
        sector: profile.finnhubIndustry || 'Unknown',
        price: quote.c,
        change: Number.isFinite(quote.dp) ? quote.dp : 0,
        high: quote.h,
        low: quote.l,
        quotedAt: quote.t * 1000,
        source: 'Finnhub',
        isLive: true,
        marketCap: Number.isFinite(profile.marketCapitalization) ? profile.marketCapitalization * 1000000 : null,
        peRatio: m.peTTM ?? null,
        roe: m.roeTTM ?? null,
        profitMargin: m.netProfitMarginTTM ?? null,
        debtRatio: m.totalDebtToEquityAnnual ?? null,
        dividend: m.dividendYieldIndicatedAnnual ?? null,
        volatility: null,
        description: profile.name ? profile.name + ' · ' + (profile.finnhubIndustry || 'Industry unavailable') : '',
        analystRating: null
    };
}

export async function fetchMarketData() {
    if (!appSettings.finnhubKey.trim()) return { stocks: [], news: [], error: 'API_KEY_MISSING' };
    const symbols = ['AAPL', 'TSLA', 'NVDA', 'AMD', 'MSFT', 'JPM', 'SPY', 'QQQ'];
    const results = await Promise.allSettled(symbols.map(async symbol => {
        const quote = await finnhub('/quote', { symbol });
        return validQuote(quote) ? buildStock(symbol, quote) : null;
    }));
    const stocks = results.filter(result => result.status === 'fulfilled' && result.value).map(result => result.value);
    let news = [];
    try {
        const items = await finnhub('/news', { category: 'general' });
        if (Array.isArray(items)) {
            news = items.slice(0, 15).filter(item => item.headline && item.url).map(item => ({
                title: item.headline, source: item.source || 'Unknown', summary: item.summary || '',
                url: item.url, datetime: item.datetime, sentiment: 'neutral'
            }));
        }
    } catch (error) {
        console.warn('News unavailable', error);
    }
    return { stocks, news, error: stocks.length ? null : 'MARKET_DATA_UNAVAILABLE' };
}

export async function fetchHistoricalPrices(symbol, days = 90) {
    const to = Math.floor(Date.now() / 1000);
    const from = to - days * 86400;
    try {
        const data = await finnhub('/stock/candle', { symbol, resolution: 'D', from, to });
        if (data.s !== 'ok' || !Array.isArray(data.c) || !Array.isArray(data.t)) return [];
        return data.c.map((close, index) => ({ price: close, time: data.t[index] * 1000 }))
            .filter(item => Number.isFinite(item.price) && Number.isFinite(item.time));
    } catch (error) {
        console.warn('Price history unavailable', error);
        return [];
    }
}

export async function fetchCompanyNews(symbol) {
    const to = new Date();
    const from = new Date(to.getTime() - 14 * 86400000);
    const date = value => value.toISOString().slice(0, 10);
    try {
        const items = await finnhub('/company-news', { symbol, from: date(from), to: date(to) });
        return Array.isArray(items) ? items.slice(0, 6).filter(item => item.headline && item.url).map(item => ({
            title: item.headline, source: item.source || 'Unknown', summary: item.summary || '',
            url: item.url, datetime: item.datetime, sentiment: 'neutral', relatedSymbol: symbol
        })) : [];
    } catch (error) {
        console.warn('Company news unavailable', error);
        return [];
    }
}

// NEW: Global Stock Search
export async function searchStocks(query) {
    const apiKey = appSettings.finnhubKey;
    
    // If no API key, return empty (UI will fallback to local)
    if (!apiKey || apiKey.trim() === "") return null;

    try {
        const res = await finnhub('/search', { q: query });
        const data = res;
        return data.result; // Returns array of { description, displaySymbol, symbol, type }
    } catch (error) {
        console.error("Search failed:", error);
        return [];
    }
}

// NEW: Fetch Detailed Info for a specific new stock found via search
export async function fetchStockDetails(symbol) {
    if (!appSettings.finnhubKey.trim()) return null;
    try {
        const [quote, profile, metrics, history, companyNews] = await Promise.all([
            finnhub('/quote', { symbol }),
            finnhub('/stock/profile2', { symbol }).catch(() => ({})),
            finnhub('/stock/metric', { symbol, metric: 'all' }).catch(() => ({})),
            fetchHistoricalPrices(symbol),
            fetchCompanyNews(symbol)
        ]);
        if (!validQuote(quote)) return null;
        return { ...buildStock(symbol, quote, profile, metrics), history, companyNews };
    } catch (error) {
        console.error('Stock detail unavailable', error);
        return null;
    }
}

// Gemini AI Analysis
export async function fetchGeminiAnalysis(prompt) {
    const apiKey = appSettings.geminiKey;
    if (!apiKey || apiKey.length < 10) throw new Error("Gemini API Key Missing or Invalid");

    // Using v1beta as gemini-1.5-flash is currently more stable there
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error("Gemini API Error details:", errData);
            // If 404 persists with 1.5-flash, fallback or inform
            throw new Error(`API Error: ${response.status} - ${errData.error?.message || 'Unknown Error'}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "I'm not sure how to answer that right now.";
        }
    } catch (e) {
        console.error("Fetch Gemini failed:", e);
        throw e;
    }
}
