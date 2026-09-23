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
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York', weekday: 'short', hour: '2-digit',
        minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    const value = type => parts.find(part => part.type === type)?.value;
    const time = Number(value('hour')) * 60 + Number(value('minute'));
    const weekday = value('weekday');
    const isRegularHours = !['Sat', 'Sun'].includes(weekday) && time >= 570 && time < 960;
    return {
        status: isRegularHours ? 'OPEN' : 'CLOSED',
        message: isRegularHours ? 'US regular trading hours (holidays not checked)' : 'Outside US regular trading hours'
    };
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

export function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
}
