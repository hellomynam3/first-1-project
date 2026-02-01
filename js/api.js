// API Service
// Roles: Handles fetching data from external sources (JSON files or real APIs)

import { appSettings } from './store.js';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export async function fetchMarketData() {
    // 1. Load basic info from local JSON first (as a base for our list)
    let localData = { stocks: [], news: [] };
    try {
        const response = await fetch('./stocks.json');
        localData = await response.json();
    } catch (e) {
        console.error("Local data failed", e);
    }

    // 2. If API Key exists, try to get LIVE prices
    const apiKey = appSettings.finnhubKey;
    if (apiKey && apiKey.trim() !== "") {
        console.log("Fetching Live Data from Finnhub...");
        try {
            // Get prices for all stocks in parallel
            const pricePromises = localData.stocks.map(async (stock) => {
                if (stock.type === 'crypto') {
                    // Crypto usually needs different endpoints, keeping local for now or using a free crypto API
                    return stock;
                }
                const res = await fetch(`${FINNHUB_BASE_URL}/quote?symbol=${stock.symbol}&token=${apiKey}`);
                const quote = await res.json();
                
                if (quote.c) { // c is current price in Finnhub
                    return {
                        ...stock,
                        price: quote.c,
                        change: parseFloat(quote.dp.toFixed(2)), // dp is percent change
                        high: quote.h,
                        low: quote.l,
                        isLive: true
                    };
                }
                return stock;
            });

            localData.stocks = await Promise.all(pricePromises);
            
            // Optionally fetch live news too
            const newsRes = await fetch(`${FINNHUB_BASE_URL}/news?category=general&token=${apiKey}`);
            const liveNews = await newsRes.json();
            if (Array.isArray(liveNews) && liveNews.length > 0) {
                localData.news = liveNews.slice(0, 5).map(n => ({
                    title: n.headline,
                    source: n.source,
                    sentiment: "neutral", // Finnhub free doesn't always give sentiment
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