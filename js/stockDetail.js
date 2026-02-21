import { stocks, news } from './store.js';
import { formatCurrency, formatNumber, getGrade } from './utils.js';
import { runMonteCarlo } from './math.js';

export function renderStockDetail(container, symbol, onBack) {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;

    const isUp = stock.change >= 0;
    const colorClass = isUp ? 'text-green' : 'text-red';
    const grade = getGrade(stock);
    const gradeColor = grade === 'S' ? '#d946ef' : grade === 'A' ? '#10b981' : grade === 'B' ? '#f59e0b' : '#ef4444';

    // Filter relevant news (mock logic: just take first 2 + random)
    const stockNews = news.slice(0, 3);

    container.innerHTML = `
        <button class="back-button" id="btn-back"><i class="fa-solid fa-arrow-left"></i> Back to Dashboard</button>
        
        <div class="glass-panel" style="padding: 24px;">
            <div class="detail-header">
                <div>
                    <h1 style="font-size: 2.5rem; margin-bottom: 5px;">${stock.symbol}</h1>
                    <div style="font-size: 1.1rem; color: #aaa;">${stock.name}</div>
                    <div style="margin-top: 10px;">
                        <span class="tag">${stock.sector}</span>
                        <span class="tag">Grade: <span style="color:${gradeColor}; font-weight:bold;">${grade}</span></span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div class="detail-price">$${stock.price.toFixed(2)}</div>
                    <div class="${colorClass}" style="font-size: 1.2rem;">${isUp ? '+' : ''}${stock.change}%</div>
                </div>
            </div>

            <div style="margin-bottom: 20px; font-size: 1.1rem; line-height: 1.6; color: #ddd;">
                "${stock.description}"
            </div>

            <div class="detail-grid">
                <!-- Left: Chart & Key Stats -->
                <div>
                    <div class="glass-panel chart-container" style="height: 300px; margin-bottom: 20px;">
                        <canvas id="detailChart"></canvas>
                    </div>
                    
                    <div class="section-title">Key Statistics</div>
                    <div class="dashboard-grid">
                        <div class="glass-panel mini-card">
                            <h3>Market Cap</h3>
                            <div class="value" style="font-size: 1.2rem;">${stock.marketCap ? formatCurrency(stock.marketCap) : 'N/A'}</div>
                        </div>
                        <div class="glass-panel mini-card">
                            <h3>P/E Ratio</h3>
                            <div class="value" style="font-size: 1.2rem;">${stock.peRatio || 'N/A'}</div>
                        </div>
                        <div class="glass-panel mini-card">
                            <h3>Dividend</h3>
                            <div class="value" style="font-size: 1.2rem;">${stock.dividend !== undefined ? stock.dividend + '%' : 'N/A'}</div>
                        </div>
                         <div class="glass-panel mini-card">
                            <h3>Analyst Rating</h3>
                            <div class="value" style="font-size: 1.1rem; color: var(--accent-yellow)">${stock.analystRating || 'Neutral'}</div>
                        </div>
                    </div>
                </div>

                <!-- Right: Analysis & News -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div class="glass-panel" style="padding: 20px;">
                        <div class="section-title"><i class="fa-solid fa-brain"></i> AI Analysis</div>
                        <p style="margin-bottom: 10px; font-size: 0.9rem;">
                            <strong>Profitability:</strong> ${stock.roe ? `ROE is ${stock.roe}%, indicating ${stock.roe > 15 ? 'high' : 'moderate'} efficiency.` : 'Data not available for this asset type.'}<br>
                            <strong>Risk:</strong> Volatility is ${(stock.volatility * 100).toFixed(1)}%, which is considered ${stock.volatility > 0.03 ? 'high' : 'stable'}.
                        </p>
                    </div>

                    <div class="glass-panel" style="padding: 20px; flex: 1;">
                        <div class="section-title"><i class="fa-regular fa-newspaper"></i> Related News</div>
                        <div id="detail-news-list">
                            ${stockNews.map(n => `
                                <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <div style="font-size: 0.9rem; font-weight: bold; margin-bottom: 4px;">${n.title}</div>
                                    <div style="font-size: 0.75rem; color: #aaa;">${n.source} • ${n.sentiment}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-back').addEventListener('click', onBack);

    // Render Chart (Monte Carlo Forecast for visual)
    renderDetailChart(stock);
}

function renderDetailChart(stock) {
    const ctx = document.getElementById('detailChart').getContext('2d');
    
    // Simulate a price history path
    const paths = runMonteCarlo(stock.price * 0.9, stock.volatility, 30, 1);
    const data = paths[0]; // Just one path for visualization

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: data.length}, (_, i) => i),
            datasets: [{
                label: 'Price Trend',
                data: data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}
