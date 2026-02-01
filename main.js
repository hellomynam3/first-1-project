/**
 * Stock AI Master V2 - Main Logic
 * Redesigned for Apple-esque Minimalist Theme
 */

// --- 1. CONFIG & STATE ---
const STATE = {
    view: 'dashboard',
    ticker: 'AAPL',
    charts: {} 
};

const MOCK_DB = {
    'AAPL': { name: 'Apple Inc.', price: 182.50, change: 0.66 },
    'NVDA': { name: 'NVIDIA Corp', price: 820.40, change: 2.51 },
    'MSFT': { name: 'Microsoft', price: 415.20, change: 1.20 },
    'TSLA': { name: 'Tesla Inc', price: 205.60, change: -2.14 },
    'RIVN': { name: 'Rivian', price: 12.50, change: -4.20 },
    '005930': { name: 'Samsung', price: 74200, change: 0.68, currency: 'KRW' }
};

// --- 2. DATA GENERATORS ---

function generateOHLC(days, startPrice = 100) {
    let series = [];
    let price = startPrice;
    let now = new Date().getTime();
    
    for (let i = days; i > 0; i--) {
        const date = now - (i * 86400000);
        const open = price;
        const close = price * (1 + (Math.random() * 0.04 - 0.02));
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        
        series.push({
            x: date,
            y: [open, high, low, close].map(n => parseFloat(n.toFixed(2)))
        });
        price = close;
    }
    return series;
}

function generateLineData(days, startPrice = 100) {
    const ohlc = generateOHLC(days, startPrice);
    return ohlc.map(d => ({ x: d.x, y: d.y[3] })); 
}

// --- 3. UI RENDERING & ROUTER ---

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderDashboard();
    setupNavigation();
    setupTabs();
    setupSimulators();
}

function setupNavigation() {
    document.querySelectorAll('.ticker-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ticker = e.target.dataset.ticker;
            router('analysis', ticker);
        });
    });

    document.getElementById('home-btn').addEventListener('click', () => {
        router('dashboard');
    });

    document.getElementById('global-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const ticker = e.target.value.toUpperCase();
            if (ticker) router('analysis', ticker);
        }
    });
}

function router(viewName, ticker = null) {
    STATE.view = viewName;
    if (ticker) STATE.ticker = ticker;

    document.querySelectorAll('.view').forEach(el => el.classList.remove('active', 'hidden'));
    document.querySelectorAll('.view').forEach(el => {
        if (el.id === `${viewName}-view`) el.classList.add('active');
        else el.classList.add('hidden');
    });

    const pageTitle = document.getElementById('page-title');
    if (viewName === 'dashboard') {
        pageTitle.innerText = 'Dashboard';
        renderDashboard();
    } else {
        pageTitle.innerText = 'Analysis';
        renderAnalysis(STATE.ticker);
    }
}

// --- 4. DASHBOARD LOGIC ---

function renderDashboard() {
    const indicesContainer = document.getElementById('indices-container');
    const trendingContainer = document.getElementById('trending-container');
    
    indicesContainer.innerHTML = '';
    trendingContainer.innerHTML = '';

    const indices = [
        { name: 'S&P 500', price: 5100.80, change: 0.50 },
        { name: 'NASDAQ', price: 16200.50, change: 0.93 },
        { name: 'Bitcoin', price: 65000.00, change: 2.10 },
        { name: 'USD/KRW', price: 1335.00, change: -0.20 }
    ];

    indices.forEach((idx, i) => {
        const id = `idx-chart-${i}`;
        const color = idx.change >= 0 ? 'text-up' : 'text-down';
        const sign = idx.change >= 0 ? '+' : '';
        const chartColor = idx.change >= 0 ? '#34c759' : '#ff3b30';

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div style="margin-bottom:12px;">
                <span class="name" style="font-weight:600; color:#86868b;">${idx.name}</span>
            </div>
            <div style="display:flex; align-items:baseline; gap:8px;">
                <span class="price" style="font-size:1.6rem; font-weight:700;">${idx.price.toLocaleString()}</span>
                <span class="${color}" style="font-weight:600;">${sign}${idx.change}%</span>
            </div>
            <div id="${id}" style="margin-top:10px; min-height:60px;"></div>
        `;
        indicesContainer.appendChild(card);
        renderSparkline(id, chartColor);
    });

    const trending = ['AAPL', 'NVDA', 'TSLA', 'MSFT'];
    trending.forEach(ticker => {
        const data = MOCK_DB[ticker] || { name: ticker, price: 100, change: 1.5 };
        const color = data.change >= 0 ? 'text-up' : 'text-down';
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                <div>
                    <div style="font-weight:700; font-size:1.1rem;">${ticker}</div>
                    <div style="font-size:0.9rem; color:#86868b;">${data.name}</div>
                </div>
                <div class="badge" style="height:fit-content;">Stock</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                <span style="font-size:1.8rem; font-weight:600;">$${data.price}</span>
                <span class="${color}" style="font-weight:600; font-size:1.1rem;">${data.change}%</span>
            </div>
        `;
        trendingContainer.appendChild(card);
        
        // Add click event for trending cards
        card.style.cursor = 'pointer';
        card.onclick = () => router('analysis', ticker);
    });
}

function renderSparkline(elementId, color) {
    const data = generateLineData(10, 1000);
    const options = {
        series: [{ data: data.map(d => d.y) }],
        chart: {
            type: 'area',
            height: 50,
            sparkline: { enabled: true }
        },
        stroke: { curve: 'smooth', width: 2 },
        fill: { opacity: 0.1 },
        colors: [color],
        tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' } }, marker: { show: false } }
    };
    new ApexCharts(document.querySelector(`#${elementId}`), options).render();
}

// --- 5. ANALYSIS LOGIC ---

function renderAnalysis(ticker) {
    const data = MOCK_DB[ticker] || { name: ticker, price: 100.00, change: 0.00 };
    
    document.getElementById('analysis-name').innerText = data.name;
    document.getElementById('analysis-ticker').innerText = ticker;
    document.getElementById('analysis-price').innerText = data.currency === 'KRW' ? `₩${data.price.toLocaleString()}` : `$${data.price}`;
    
    const changeEl = document.getElementById('analysis-change');
    changeEl.innerText = `${data.change >= 0 ? '+' : ''}${data.change}%`;
    changeEl.className = `price-change ${data.change >= 0 ? 'text-up' : 'text-down'}`;

    switchTab('chart');
}

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.target.dataset.tab;
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');

    const ticker = STATE.ticker;
    if (tabId === 'chart') loadAdvancedChart(ticker);
    if (tabId === 'compare') loadComparisonChart(ticker);
    if (tabId === 'financials') loadFinancials(ticker);
    if (tabId === 'news') loadNews(ticker);
    if (tabId === 'simulator') loadSimulator(ticker);
}

function loadAdvancedChart(ticker) {
    if (STATE.charts.main) STATE.charts.main.destroy();

    const data = generateOHLC(90, MOCK_DB[ticker]?.price || 100);
    
    const options = {
        series: [{ name: 'Price', data: data }],
        chart: {
            type: 'candlestick',
            height: 400,
            toolbar: { show: false },
            fontFamily: '-apple-system, sans-serif'
        },
        theme: { mode: 'light' }, // Light Theme
        xaxis: {
            type: 'datetime',
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        grid: {
            borderColor: '#f5f5f7',
            xaxis: { lines: { show: false } } 
        },
        plotOptions: {
            candlestick: {
                colors: { upward: '#34c759', downward: '#ff3b30' }
            }
        }
    };

    const chart = new ApexCharts(document.querySelector("#main-candlestick-chart"), options);
    chart.render();
    STATE.charts.main = chart;
}

function loadComparisonChart(ticker) {
    const compInput = document.getElementById('compare-ticker-input');
    const compBtn = document.getElementById('run-compare-btn');
    
    compBtn.onclick = () => renderComparison(ticker, compInput.value.toUpperCase());
    renderComparison(ticker, compInput.value);
}

function renderComparison(tickerA, tickerB) {
    if (STATE.charts.compare) STATE.charts.compare.destroy();

    const dataA = generateLineData(100, 100);
    const dataB = generateLineData(100, 100);

    const normalize = (arr) => {
        const start = arr[0].y;
        return arr.map(d => ({ x: d.x, y: ((d.y - start) / start) * 100 }));
    };

    const options = {
        series: [
            { name: tickerA, data: normalize(dataA) },
            { name: tickerB, data: normalize(dataB) }
        ],
        chart: { type: 'line', height: 400, toolbar: { show: false } },
        stroke: { width: 2, curve: 'smooth' },
        colors: ['#0071e3', '#86868b'], // Apple Blue vs Gray
        xaxis: { type: 'datetime', axisBorder: { show: false } },
        grid: { borderColor: '#f5f5f7' },
        yaxis: { labels: { formatter: (val) => val.toFixed(1) + '%' } }
    };

    const chart = new ApexCharts(document.querySelector("#comparison-chart"), options);
    chart.render();
    STATE.charts.compare = chart;
}

function loadFinancials(ticker) {
    const mktCap = (Math.random() * 2 + 0.5).toFixed(1);
    const per = (Math.random() * 50 + 20).toFixed(1);
    const rev = (Math.random() * 50 + 10).toFixed(1);

    document.getElementById('fin-mkt-cap').innerText = `$${mktCap}T`;
    document.getElementById('fin-per').innerText = per;
    document.getElementById('fin-rev').innerText = `+${rev}%`;
}

function loadNews(ticker) {
    const feed = document.getElementById('news-feed');
    feed.innerHTML = '';

    const templates = [
        { text: "Hits All-Time High", type: 'pos' },
        { text: "Facing Antitrust Concerns", type: 'neg' },
        { text: "Announces New Product Line", type: 'pos' },
        { text: "Quarterly Revenue Beats Estimates", type: 'pos' },
        { text: "Supply Chain Delays Expected", type: 'neg' }
    ];

    for (let i = 0; i < 5; i++) {
        const item = templates[Math.floor(Math.random() * templates.length)];
        const div = document.createElement('div');
        div.className = 'news-item';
        div.innerHTML = `
            <div>
                <div class="news-title">${ticker} ${item.text}</div>
                <div class="news-meta">Wall St. Journal • 2h ago</div>
            </div>
            <span class="sentiment-badge ${item.type === 'pos' ? 'sentiment-pos' : 'sentiment-neg'}">
                ${item.type === 'pos' ? 'BULLISH' : 'BEARISH'}
            </span>
        `;
        feed.appendChild(div);
    }
}

function setupSimulators() {
    document.getElementById('run-sim-btn').addEventListener('click', () => {
        loadSimulator(STATE.ticker, true);
    });
}

function loadSimulator(ticker) {
    const amount = parseFloat(document.getElementById('sim-amount').value);
    const durationYears = parseInt(document.getElementById('sim-duration').value);
    
    const months = durationYears * 12;
    const historicalData = generateLineData(months * 30, 100);
    
    let totalInvested = 0;
    let totalShares = 0;
    const assetGrowth = [];
    const monthlyPoints = historicalData.filter((_, i) => i % 30 === 0).slice(0, months);

    monthlyPoints.forEach((point) => {
        totalInvested += amount;
        totalShares += amount / point.y;
        assetGrowth.push({ x: point.x, y: totalShares * point.y });
    });

    const finalValue = totalShares * monthlyPoints[monthlyPoints.length - 1].y;
    const yieldPercent = ((finalValue - totalInvested) / totalInvested) * 100;

    document.getElementById('sim-invested').innerText = `$${totalInvested.toLocaleString()}`;
    document.getElementById('sim-final').innerText = `$${Math.round(finalValue).toLocaleString()}`;
    document.getElementById('sim-yield').innerText = `${yieldPercent > 0 ? '+' : ''}${yieldPercent.toFixed(1)}%`;

    if (STATE.charts.sim) STATE.charts.sim.destroy();

    const options = {
        series: [{ name: 'Value', data: assetGrowth }],
        chart: { type: 'area', height: 350, toolbar: { show: false } },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#34c759'],
        fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
        xaxis: { type: 'datetime', axisBorder: { show: false } },
        yaxis: { labels: { formatter: (val) => '$' + Math.round(val) } },
        grid: { borderColor: '#f5f5f7' }
    };

    const chart = new ApexCharts(document.querySelector("#simulator-chart"), options);
    chart.render();
    STATE.charts.sim = chart;
}

window.router = router;
