import { stocks, news, appSettings, translations, portfolio, watchlist, addToPortfolio, removeFromPortfolio, addToWatchlist, removeFromWatchlist } from './store.js';
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

        <!-- Portfolio Section -->
        <div class="section-title" style="margin-top:20px;">
            <i class="fa-solid fa-wallet"></i> ${t.portfolio}
        </div>
        <div class="glass-panel" style="padding:20px; margin-bottom:20px;">
            <div id="portfolio-summary" style="margin-bottom:20px; font-size:1.2rem; font-weight:bold;"></div>
            <div id="portfolio-list" style="display:grid; gap:10px;"></div>
            
            <!-- Add Holding Form -->
            <div style="margin-top:20px; padding-top:20px; border-top:1px solid var(--glass-border); display:flex; gap:10px; flex-wrap:wrap;">
                <input type="text" id="port-symbol" placeholder="${t.symbol}" class="styled-input" style="width:100px; text-transform:uppercase;">
                <input type="number" id="port-price" placeholder="${t.buy_price}" class="styled-input" style="width:100px;">
                <input type="number" id="port-qty" placeholder="${t.qty}" class="styled-input" style="width:80px;">
                <button id="btn-add-port" class="action-btn">${t.add}</button>
            </div>
        </div>
        
        <!-- Watchlist Section -->
        <div class="section-title" style="display:flex; justify-content:space-between; align-items:center;">
            <span><i class="fa-solid fa-fire"></i> ${t.watchlist}</span>
            <div style="display:flex; gap:10px;">
                <input type="text" id="watch-symbol" placeholder="${t.symbol}" class="styled-input" style="width:100px; padding:5px; font-size:0.9rem; text-transform:uppercase;">
                <button id="btn-add-watch" class="action-btn" style="padding:5px 10px; font-size:0.9rem;">${t.add}</button>
            </div>
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
    renderPortfolio();
    renderWatchlist(onStockClick);
    renderNews(onNewsClick);

    // Event Listeners
    document.getElementById('btn-add-port').addEventListener('click', () => {
        const s = document.getElementById('port-symbol').value.toUpperCase();
        const p = parseFloat(document.getElementById('port-price').value);
        const q = parseFloat(document.getElementById('port-qty').value);
        if(s && p && q) {
            addToPortfolio(s, p, q);
            renderPortfolio();
            // Clear inputs
            document.getElementById('port-symbol').value = '';
            document.getElementById('port-price').value = '';
            document.getElementById('port-qty').value = '';
        }
    });

    document.getElementById('btn-add-watch').addEventListener('click', () => {
        const s = document.getElementById('watch-symbol').value.toUpperCase();
        if(s) {
            // Check if valid stock (optional, but good)
            const exists = stocks.find(st => st.symbol === s);
            if(exists) {
                addToWatchlist(s);
                renderWatchlist(onStockClick);
                document.getElementById('watch-symbol').value = '';
            } else {
                alert('Symbol not found in demo data (Try: AAPL, TSLA, NVDA, AMD, MSFT)');
            }
        }
    });
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

function renderPortfolio() {
    const container = document.getElementById('portfolio-list');
    const summary = document.getElementById('portfolio-summary');
    const t = translations[appSettings.lang];
    
    if (portfolio.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:var(--text-secondary); padding:20px;">No holdings added yet.</div>`;
        summary.innerHTML = '';
        return;
    }

    let totalVal = 0;
    let totalCost = 0;

    container.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr 50px; padding-bottom:10px; border-bottom:1px solid var(--glass-border); font-size:0.9rem; color:var(--text-secondary);">
            <div>${t.symbol}</div>
            <div>Avg Price</div>
            <div>Current</div>
            <div>Profit/Loss</div>
            <div></div>
        </div>
    `;

    portfolio.forEach(p => {
        const stock = stocks.find(s => s.symbol === p.symbol);
        const currentPrice = stock ? stock.price : p.avgPrice; // Fallback
        const marketVal = currentPrice * p.quantity;
        const costBasis = p.avgPrice * p.quantity;
        const pl = marketVal - costBasis;
        const plPercent = (pl / costBasis) * 100;
        
        totalVal += marketVal;
        totalCost += costBasis;

        const isUp = pl >= 0;
        const colorClass = isUp ? 'text-green' : 'text-red';

        const row = document.createElement('div');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '1fr 1fr 1fr 1fr 50px';
        row.style.padding = '12px 0';
        row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        row.style.alignItems = 'center';
        
        row.innerHTML = `
            <div style="font-weight:bold;">${p.symbol} <span style="font-size:0.8rem; color:var(--text-secondary);">x${p.quantity}</span></div>
            <div>$${p.avgPrice.toFixed(2)}</div>
            <div>$${currentPrice.toFixed(2)}</div>
            <div class="${colorClass}">
                $${Math.abs(pl).toFixed(2)} (${plPercent.toFixed(1)}%)
            </div>
            <div style="text-align:right;">
                <button class="remove-port-btn" data-symbol="${p.symbol}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(row);
    });

    const totalPL = totalVal - totalCost;
    const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
    const totalColor = totalPL >= 0 ? 'text-green' : 'text-red';

    summary.innerHTML = `
        ${t.total_profit}: <span class="${totalColor}">$${totalPL.toFixed(2)} (${totalPLPercent.toFixed(1)}%)</span>
        <div style="font-size:0.9rem; font-weight:normal; color:var(--text-secondary); margin-top:5px;">
            Total Value: $${totalVal.toFixed(2)}
        </div>
    `;

    // Bind remove events
    container.querySelectorAll('.remove-port-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sym = e.currentTarget.dataset.symbol; // Use currentTarget for button
            removeFromPortfolio(sym);
            renderPortfolio();
        });
    });
}

function renderWatchlist(onStockClick) {
    const t = translations[appSettings.lang];
    const container = document.getElementById('watchlist');
    container.innerHTML = ''; // Clear

    // Filter stocks that are in the watchlist array
    const myStocks = stocks.filter(s => watchlist.includes(s.symbol));

    // Handle case where watchlist has symbols not in data (e.g., loaded from localstorage but API failed)
    // For now, we only show matches.

    if (myStocks.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:20px; color:var(--text-secondary);">Your watchlist is empty.</div>`;
        return;
    }

    myStocks.forEach(s => {
        const isUp = s.change >= 0;
        const colorClass = isUp ? 'text-green' : 'text-red';
        const ratingColor = s.analystRating.includes('Buy') ? 'text-green' : 'text-secondary';
        
        const card = document.createElement('div');
        card.className = 'glass-panel stock-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span class="stock-badge">${s.symbol} ${s.isLive ? '<span class="live-pulse">LIVE</span>' : ''}</span>
                <button class="remove-watch-btn" data-symbol="${s.symbol}" style="background:none; border:none; color:var(--text-secondary); cursor:pointer;">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                <div>
                    <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px;">
                        ${s.name}
                    </div>
                    <div style="font-size:1.6rem; font-weight:bold;">$${s.price.toFixed(2)}</div>
                </div>
                <div class="${colorClass}" style="font-weight:bold; font-size:1.1rem; margin-bottom:5px;">${isUp ? '+' : ''}${s.change}%</div>
            </div>
            
            <div class="info-chips" style="margin-top:10px;">
                <div class="chip">${t.mcap}: ${formatCurrency(s.marketCap)}</div>
                <div class="chip">${t.per}: ${s.peRatio}</div>
            </div>
        `;
        
        // Click on card body to detail, but not on remove button
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-watch-btn')) {
                if (onStockClick) onStockClick(s.symbol);
            }
        });

        // Remove button logic
        const removeBtn = card.querySelector('.remove-watch-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromWatchlist(s.symbol);
            renderWatchlist(onStockClick);
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
