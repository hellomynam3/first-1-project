// Business Utilities
// Roles: Domain-specific logic, helpers, and status checks

export function formatCurrency(value) {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
}

export function formatNumber(value) {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    return value.toLocaleString();
}

export function getMarketStatus() {
    // Simple check for NY Time
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

export function getGrade(stock) {
    let score = 0;
    
    // ROE Weight
    if (stock.roe > 20) score += 30;
    else if (stock.roe > 10) score += 15;
    
    // Margin Weight
    if (stock.profitMargin > 20) score += 30;
    else if (stock.profitMargin > 10) score += 15;

    // Debt Weight
    if (stock.debtRatio < 50) score += 40;
    else if (stock.debtRatio < 100) score += 20;

    // Grading Scale
    if (score >= 90) return 'S';
    if (score >= 70) return 'A';
    if (score >= 50) return 'B';
    return 'C';
}
