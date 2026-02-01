import { stocks, news, getMarketStatus, generateHistory } from './data.js';

export function renderDashboard(container) {
    container.innerHTML = `
        <div class="dashboard-grid" id="mini-indices"></div>
        
        <div class="section-title">
            <i class="fa-solid fa-fire"></i> Your Watchlist
        </div>
        <div class="watchlist-grid" id="watchlist"></div>

        <div class="section-title">
            <i class="fa-regular fa-newspaper"></i> AI Sentiment News
        </div>
        <div class="news-section" id="news-feed"></div>
    `;

    updateMarketStatus();
    renderIndices();
    renderWatchlist();
    renderNews();
}

function updateMarketStatus() {
    const statusEl = document.getElementById('market-status');
    const { status, message } = getMarketStatus();
    const dotClass = status === 'OPEN' ? 'status-open' : 'status-closed';
    
    statusEl.innerHTML = `<span class="status-dot ${dotClass}"></span> ${message}`;
}

function renderIndices() {
    const container = document.getElementById('mini-indices');
    const indices = stocks.filter(s => s.type === 'index' || s.type === 'crypto');

    indices.forEach(idx => {
        const isUp = idx.change >= 0;
        const colorClass = isUp ? 'text-green' : 'text-red';
        const sign = isUp ? '+' : '';
        
        const card = document.createElement('div');
        card.className = 'glass-panel mini-card';
        card.innerHTML = `
            <h3>${idx.name}</h3>
            <div class="value">${idx.price.toLocaleString()}</div>
            <div class="change ${colorClass}">${sign}${idx.change}%</div>
            <canvas id="chart-${idx.symbol}" height="30"></canvas>
        `;
        container.appendChild(card);
        
        // Render sparkline
        renderSparkline(`chart-${idx.symbol}`, isUp ? '#10b981' : '#ef4444');
    });
}

function renderWatchlist() {
    const container = document.getElementById('watchlist');
    const myStocks = stocks.filter(s => !s.type); // Just stocks

    myStocks.forEach(s => {
        const isUp = s.change >= 0;
        const colorClass = isUp ? 'text-green' : 'text-red';
        
        const card = document.createElement('div');
        card.className = 'glass-panel stock-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <strong>${s.symbol}</strong>
                <span class="${colorClass}">${s.change}%</span>
            </div>
            <div style="font-size:0.9rem; color:#aaa;">${s.name}</div>
            <div style="font-size:1.5rem; font-weight:bold; margin-top:5px;">$${s.price}</div>
        `;
        container.appendChild(card);
    });
}

function renderNews() {
    const container = document.getElementById('news-feed');
    news.forEach(n => {
        const card = document.createElement('div');
        card.className = `glass-panel news-card ${n.sentiment}`;
        card.innerHTML = `
            <div style="font-weight:bold; margin-bottom:5px;">${n.title}</div>
            <div style="font-size:0.8rem; color:#aaa;">${n.source} • AI Analysis: ${n.sentiment.toUpperCase()}</div>
        `;
        container.appendChild(card);
    });
}

function renderSparkline(canvasId, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const data = generateHistory(100, 20); // 20 points
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                data: data,
                borderColor: color,
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });
}
