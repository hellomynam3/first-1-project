// Math Engine
// Roles: Pure mathematical functions, simulations, and statistical calculations

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

// Mock historical data generator for Sparklines
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

    const rs = avgGain / (avgLoss || 1); // Avoid div by zero
    return 100 - (100 / (1 + rs));
}

// Simple Moving Average (SMA)
export function calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(0, period).reduce((a, b) => a + b, 0);
    return sum / period;
}

// Bollinger Bands (SMA +/- 2 * StdDev)
export function calculateBollingerBands(prices, period = 20) {
    if (prices.length < period) return null;
    
    const sma = calculateSMA(prices, period);
    const slice = prices.slice(0, period);
    
    const squaredDiffs = slice.map(p => Math.pow(p - sma, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const stdDev = Math.sqrt(variance);

    return {
        upper: sma + (2 * stdDev),
        middle: sma,
        lower: sma - (2 * stdDev)
    };
}
