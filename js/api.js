// API Service
// Roles: Handles fetching data from external sources (JSON files or real APIs)

import { appSettings } from './store.js';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export async function fetchMarketData() {
    // 1. Load basic info from local JSON first
    let localData = { stocks: [], news: [] };
    try {
        const response = await fetch('./stocks.json');
        localData = await response.json();
    } catch (e) {
        console.error("Local data failed", e);
    }

    // 2. If API Key exists, try to get LIVE prices for the watchlist
    const apiKey = appSettings.finnhubKey;
    if (apiKey && apiKey.trim() !== "") {
        console.log("Fetching Live Data from Finnhub...");
        try {
            const pricePromises = localData.stocks.map(async (stock) => {
                if (stock.type === 'crypto') return stock; // Skip crypto for now
                const res = await fetch(`${FINNHUB_BASE_URL}/quote?symbol=${stock.symbol}&token=${apiKey}`);
                const quote = await res.json();
                
                if (quote.c) {
                    return {
                        ...stock,
                        price: quote.c,
                        change: parseFloat(quote.dp.toFixed(2)),
                        high: quote.h,
                        low: quote.l,
                        isLive: true
                    };
                }
                return stock;
            });

            localData.stocks = await Promise.all(pricePromises);
            
            const newsRes = await fetch(`${FINNHUB_BASE_URL}/news?category=general&token=${apiKey}`);
            const liveNews = await newsRes.json();
            if (Array.isArray(liveNews) && liveNews.length > 0) {
                localData.news = liveNews.slice(0, 5).map(n => ({
                    title: n.headline,
                    source: n.source,
                    sentiment: "neutral",
                    summary: n.summary,
                    url: n.url
                }));
            }
        } catch (error) {
            console.error('Finnhub Fetch Failed:', error);
        }
    }

    return localData;
}

// NEW: Global Stock Search
export async function searchStocks(query) {
    const apiKey = appSettings.finnhubKey;
    
    // If no API key, return empty (UI will fallback to local)
    if (!apiKey || apiKey.trim() === "") return null;

    try {
        const res = await fetch(`${FINNHUB_BASE_URL}/search?q=${query}&token=${apiKey}`);
        const data = await res.json();
        return data.result; // Returns array of { description, displaySymbol, symbol, type }
    } catch (error) {
        console.error("Search failed:", error);
        return [];
    }
}

// NEW: Fetch Detailed Info for a specific new stock found via search
export async function fetchStockDetails(symbol) {
    const apiKey = appSettings.finnhubKey;
    if (!apiKey) return null;

    try {
        // Parallel fetch: Quote + Profile
        const [quoteRes, profileRes] = await Promise.all([
            fetch(`${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`),
            fetch(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${apiKey}`)
        ]);

        const quote = await quoteRes.json();
        const profile = await profileRes.json();

        if (!quote.c) return null;

        return {
            symbol: symbol,
            name: profile.name || symbol,
            price: quote.c,
            change: parseFloat(quote.dp?.toFixed(2) || 0),
            volatility: 0.02, // Default fallback
            roe: 10, // Default fallback
            debtRatio: 50, // Default fallback
            profitMargin: 10, // Default fallback
            sentiment: 'neutral',
            sector: profile.finnhubIndustry || 'Unknown',
            marketCap: (profile.marketCapitalization || 0) * 1000000, // Finnhub returns in millions
            peRatio: 20, // Not always available in free tier
            dividend: 0,
            analystRating: 'Hold',
            description: `${profile.name} operates in the ${profile.finnhubIndustry} industry.`,
            isLive: true
        };
    } catch (e) {
        console.error("Detail fetch failed", e);
        return null;
    }
}
