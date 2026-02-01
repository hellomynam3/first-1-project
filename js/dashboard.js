import { stocks, news, appSettings, translations } from './store.js';
import { getMarketStatus, formatCurrency } from './utils.js';
import { generateHistory } from './math.js';

export function renderDashboard(container, onStockClick, onNewsClick) {
    const t = translations[appSettings.lang];

    container.innerHTML = `
        <div class="dashboard-header-grid">
            <div class="section-column">
                <div class="section-title"><i class="fa-solid fa-chart-simple"></i> ${t.indices}</div>
                <div class="dashboard-grid" id="mini-indices"></div>
            </div>
            <div class="section-column">
                <div class="section-title"><i class="fa-solid fa-chart-pie"></i> ${t.sectors}</div>
                <div class="glass-panel sector-panel" id="sector-performance">
                    <!-- JS Injected -->
                </div>
            </div>
        </div>
        
        <div class="section-title" style="margin-top:20px;">
            <i class="fa-solid fa-fire"></i> ${t.watchlist}
        </div>
        <div class="watchlist-grid" id="watchlist"></div>

        <div class="section-title">
            <i class="fa-regular fa-newspaper"></i> ${t.news}
        </div>
        <div class="news-section" id="news-feed"></div>
    `;

    updateMarketStatus();
    renderIndices();
    renderSectors();
    renderWatchlist(onStockClick);
    renderNews(onNewsClick);
}

function updateMarketStatus() {
    const t = translations[appSettings.lang];
    const statusEl = document.getElementById('market-status');
    const { status } = getMarketStatus();
    const dotClass = status === 'OPEN' ? 'status-open' : 'status-closed';
    const msg = status === 'OPEN' ? t.market_open : t.market_closed;
    
    statusEl.innerHTML = `<span class="status-dot ${dotClass}"></span> ${msg}`;
}

function renderIndices() {
    const container = document.getElementById('mini-indices');
    const indices = stocks.filter(s => s.type === 'index' || s.type === 'crypto');

    indices.forEach(idx => {
        const isUp = idx.change >= 0;
        const colorClass = isUp ? 'text-green' : 'text-red';
        const sign = isUp ? '+' : '';
        const chartColor = isUp ? '#10b981' : '#ef4444';
        
        const card = document.createElement('div');
        card.className = 'glass-panel mini-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <h3>${idx.name}</h3>
                    <div class="value">${idx.price.toLocaleString()}</div>
                    <div class="change ${colorClass}">${sign}${idx.change}%</div>
                </div>
                <div style="width:80px; height:50px;">
                    <canvas id="chart-${idx.symbol}" width="80" height="50"></canvas>
                </div>
            </div>
        `;
        container.appendChild(card);
        renderSparkline(`chart-${idx.symbol}`, chartColor);
    });
}

function renderSectors() {
    const container = document.getElementById('sector-performance');
    // For full translation, sector names should also be in dictionary, keeping EN for now as demo
    const sectors = [
        { name: 'Technology', change: 1.2 },
        { name: 'Financial', change: -0.5 },
        { name: 'Cons. Cyclical', change: -0.2 },
        { name: 'Healthcare', change: 0.8 },
        { name: 'Energy', change: 0.1 }
    ];

    sectors.forEach(sec => {
        const isUp = sec.change >= 0;
        const color = isUp ? 'var(--accent-green)' : 'var(--accent-red)';
        const width = Math.abs(sec.change) * 20 + 10;
        
        const row = document.createElement('div');
        row.className = 'sector-row';
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.marginBottom = '8px';
        row.style.fontSize = '0.9rem';

        row.innerHTML = `
            <div style="width:100px; color:var(--text-secondary);">${sec.name}</div>
            <div style="flex:1; background:rgba(125,125,125,0.2); height:8px; border-radius:4px; overflow:hidden;">
                <div style="width:${width}%; height:100%; background:${color};"></div>
            </div>
            <div style="width:50px; text-align:right; color:${color};">${sec.change > 0 ? '+' : ''}${sec.change}%</div>
        `;
        container.appendChild(row);
    });
}

function renderWatchlist(onStockClick) {
    const t = translations[appSettings.lang];
    const container = document.getElementById('watchlist');
    const myStocks = stocks.filter(s => !s.type);

    myStocks.forEach(s => {
        const isUp = s.change >= 0;
        const colorClass = isUp ? 'text-green' : 'text-red';
        const ratingColor = s.analystRating.includes('Buy') ? 'text-green' : 'text-secondary';
        
        const card = document.createElement('div');
        card.className = 'glass-panel stock-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span class="stock-badge">${s.symbol} ${s.isLive ? '<span class="live-pulse">LIVE</span>' : ''}</span>
                <span class="${colorClass}" style="font-weight:bold;">${isUp ? '+' : ''}${s.change}%</span>
            </div>
            <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${s.name}
            </div>
            <div style="font-size:1.8rem; font-weight:bold; margin-bottom:10px;">$${s.price.toFixed(2)}</div>
            
            <div class="info-chips">
                <div class="chip">${t.mcap}: ${formatCurrency(s.marketCap)}</div>
                <div class="chip">${t.per}: ${s.peRatio}</div>
            </div>
            <div style="margin-top:10px; font-size:0.8rem; color:var(--text-secondary);">
                ${t.rating}: <span class="${ratingColor}">${s.analystRating}</span>
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (onStockClick) onStockClick(s.symbol);
        });

        container.appendChild(card);
    });
}

function renderNews(onNewsClick) {
    const container = document.getElementById('news-feed');
    news.forEach(n => {
        const card = document.createElement('div');
        card.className = `glass-panel news-card ${n.sentiment}`;
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase;">${n.source}</span>
                <span class="sentiment-badge ${n.sentiment}">${n.sentiment.toUpperCase()}</span>
            </div>
            <div style="font-weight:bold; font-size:1rem; margin-bottom:5px;">${n.title}</div>
            <div style="font-size:0.85rem; color:var(--text-secondary); line-height:1.4;">${n.summary}</div>
        `;

        card.addEventListener('click', () => {
            if (onNewsClick) onNewsClick(n);
        });

        container.appendChild(card);
    });
}

function renderSparkline(canvasId, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = generateHistory(100, 20); 
    
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
            responsive: false,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });
}