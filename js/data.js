// Mock Data & Calculation Engine

export const stocks = [
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: 118.50, change: 2.45, volatility: 0.035, roe: 65, debtRatio: 40, profitMargin: 55, sentiment: 'positive' },
    { symbol: 'TSLA', name: 'Tesla Inc', price: 245.30, change: -1.20, volatility: 0.045, roe: 22, debtRatio: 15, profitMargin: 12, sentiment: 'neutral' },
    { symbol: 'AAPL', name: 'Apple Inc', price: 215.00, change: 0.50, volatility: 0.015, roe: 150, debtRatio: 180, profitMargin: 25, sentiment: 'positive' },
    { symbol: 'AMD', name: 'Adv Micro Devices', price: 160.10, change: -0.80, volatility: 0.040, roe: 8, debtRatio: 5, profitMargin: 4, sentiment: 'negative' },
    { symbol: 'SPY', name: 'S&P 500 ETF', price: 540.20, change: 0.35, volatility: 0.010, type: 'index' },
    { symbol: 'QQQ', name: 'Nasdaq 100 ETF', price: 475.50, change: 0.60, volatility: 0.015, type: 'index' },
    { symbol: 'BTC', name: 'Bitcoin', price: 67500.00, change: 3.20, volatility: 0.050, type: 'crypto' },
];

export const news = [
    { title: "Fed signals potential rate cuts later this year", source: "Bloomberg", sentiment: "positive" },
    { title: "Tech sector faces headwinds from supply chain issues", source: "Reuters", sentiment: "negative" },
    { title: "NVIDIA announces new AI chip architecture", source: "TechCrunch", sentiment: "positive" },
    { title: "Oil prices stabilize amidst global uncertainty", source: "CNBC", sentiment: "neutral" }
];

export function getMarketStatus() {
    // Simple check for NY Time (UTC-4 or UTC-5 depending on DST, assuming -4 for simplicity or just basic logic)
    // For this prototype, we'll just check if it's a weekday between 9:30 AM and 4:00 PM local time to keep it simple for the user demo
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Convert to simple minutes for comparison
    const timeInMinutes = hour * 60 + minute;
    const marketOpen = 9 * 60 + 30;
    const marketClose = 16 * 60;

    const isOpen = day >= 1 && day <= 5 && timeInMinutes >= marketOpen && timeInMinutes <= marketClose;
    return isOpen ? { status: 'OPEN', message: 'US Market is Open' } : { status: 'CLOSED', message: 'US Market is Closed' };
}

// Monte Carlo Simulation
// Returns an array of arrays (paths)
export function runMonteCarlo(startPrice, volatility, days, simulations = 50) {
    const paths = [];
    for (let i = 0; i < simulations; i++) {
        let price = startPrice;
        const path = [price];
        for (let d = 0; d < days; d++) {
            // Geometric Brownian Motion approximation
            const change = price * volatility * (Math.random() - 0.5); 
            price += change;
            path.push(price);
        }
        paths.push(path);
    }
    return paths;
}

// Mock historical data generator
export function generateHistory(startPrice, days) {
    let price = startPrice;
    const history = [];
    for (let i = 0; i < days; i++) {
        history.unshift(price); // Past to Present
        price = price - (price * 0.02 * (Math.random() - 0.5)); // Reverse walk
    }
    return history;
}

// RSI Calculation
export function calculateRSI(prices, period = 14) {
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < period + 1; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    const rsiArray = [];
    
    // Just a quick mock for the latest value
    const rs = avgGain / (avgLoss || 1); // Avoid div by zero
    return 100 - (100 / (1 + rs));
}

export function getGrade(stock) {
    let score = 0;
    if (stock.roe > 20) score += 30;
    else if (stock.roe > 10) score += 15;
    
    if (stock.profitMargin > 20) score += 30;
    else if (stock.profitMargin > 10) score += 15;

    if (stock.debtRatio < 50) score += 40;
    else if (stock.debtRatio < 100) score += 20;

    if (score >= 90) return 'S';
    if (score >= 70) return 'A';
    if (score >= 50) return 'B';
    return 'C';
}
