/**
 * Stock AI Master V2 - Main Logic
 * Features: Mock Data Generator, SPA Router, ApexCharts Integration
 */

// --- 1. CONFIG & STATE ---
const STATE = {
    view: 'dashboard',
    ticker: 'NVDA', // Default selected ticker
    charts: {} // Store ApexCharts instances to destroy/update them
};

const SECTORS = {
    'Aerospace': ['RKLB', 'SPCE', 'LMT'],
    'AI': ['NVDA', 'AMD', 'PLTR', 'SMCI'],
    'EV': ['TSLA', 'RIVN', 'LCID'],
    'Korea': ['005930', '000660']
};

const MOCK_DB = {
    'NVDA': { name: 'NVIDIA Corp', price: 820.40, change: 2.51 },
    'AMD': { name: 'Advanced Micro Devices', price: 162.50, change: -1.2 },
    'TSLA': { name: 'Tesla Inc', price: 205.60, change: -2.14 },
    'RKLB': { name: 'Rocket Lab USA', price: 4.85, change: 5.20 },
    '005930': { name: 'Samsung Electronics', price: 74200, change: 0.68, currency: 'KRW' },
    '000660': { name: 'SK Hynix', price: 145000, change: -1.02, currency: 'KRW' }
    // Others will be auto-generated if missing
};

// --- 2. DATA GENERATORS ---

/**
 * Generates CandleStick Data (OHLC)
 * @param {number} days - Number of days to generate
 * @param {number} startPrice - Starting price
 */
function generateOHLC(days, startPrice = 100) {
    let series = [];
    let price = startPrice;
    let now = new Date().getTime();
    
    for (let i = days; i > 0; i--) {
        const date = now - (i * 86400000);
        // Volatility 2%
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

/**
 * Generates Line Data (Close Price)
 */
function generateLineData(days, startPrice = 100) {
    const ohlc = generateOHLC(days, startPrice);
    return ohlc.map(d => ({ x: d.x, y: d.y[3] })); // Return closing prices
}

// --- 3. UI RENDERING & ROUTER ---

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Render Dashboard initially
    renderDashboard();
    
    // Event Listeners
    setupNavigation();
    setupTabs();
    setupSimulators();
}

function setupNavigation() {
    // Sidebar Ticker Clicks
    document.querySelectorAll('.ticker-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ticker = e.target.dataset.ticker;
            router('analysis', ticker);
        });
    });

    // Home Button
    document.getElementById('home-btn').addEventListener('click', () => {
        router('dashboard');
    });

    // Search (Simple Enter Handler)
    document.getElementById('global-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const ticker = e.target.value.toUpperCase();
            if (ticker) router('analysis', ticker);
        }
    });
}

function router(viewName, ticker = null) {
    // Update State
    STATE.view = viewName;
    if (ticker) STATE.ticker = ticker;

    // Toggle Views
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active', 'hidden'));
    document.querySelectorAll('.view').forEach(el => {
        if (el.id === `${viewName}-view`) el.classList.add('active');
        else el.classList.add('hidden');
    });

    // Update Header Title
    const pageTitle = document.getElementById('page-title');
    if (viewName === 'dashboard') {
        pageTitle.innerText = 'Market Dashboard';
        renderDashboard();
    } else {
        pageTitle.innerText = 'Deep Analysis';
        renderAnalysis(STATE.ticker);
    }
}

// --- 4. DASHBOARD LOGIC ---

function renderDashboard() {
    const indicesContainer = document.getElementById('indices-container');
    const trendingContainer = document.getElementById('trending-container');
    
    // Clear previous
    indicesContainer.innerHTML = '';
    trendingContainer.innerHTML = '';

    // 1. Indices
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
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <span class="name">${idx.name}</span>
            </div>
            <div class="price-container">
                <span class="price">${idx.price.toLocaleString()}</span>
                <span class="change-container ${color}">${sign}${idx.change}%</span>
            </div>
            <div id="${id}" style="min-height: 60px;"></div>
        `;
        indicesContainer.appendChild(card);

        // Render Sparkline
        renderSparkline(id, idx.change >= 0 ? '#ef4444' : '#3b82f6');
    });

    // 2. Trending Stocks
    const trending = ['NVDA', 'TSLA', 'RKLB', 'AMD'];
    trending.forEach(ticker => {
        const data = MOCK_DB[ticker] || { name: ticker, price: 100, change: 1.5 };
        const color = data.change >= 0 ? 'text-up' : 'text-down';
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <span class="symbol">${ticker}</span>
                <span class="badge" style="font-size: 0.7rem; cursor:pointer;" onclick="router('analysis', '${ticker}')">Analyze</span>
            </div>
            <div class="name" style="font-size:0.9rem; margin-bottom:8px;">${data.name}</div>
            <div class="price-container">
                <span class="price" style="font-size:1.2rem;">${data.price}</span>
                <span class="change-container ${color}">${data.change}%</span>
            </div>
        `;
        trendingContainer.appendChild(card);
    });
}

function renderSparkline(elementId, color) {
    const data = generateLineData(5, 1000); // 5 days data
    const options = {
        series: [{ data: data.map(d => d.y) }],
        chart: {
            type: 'area',
            height: 60,
            sparkline: { enabled: true }
        },
        stroke: { curve: 'smooth', width: 2 },
        fill: { opacity: 0.2 },
        colors: [color],
        tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' } }, marker: { show: false } }
    };
    new ApexCharts(document.querySelector(`#${elementId}`), options).render();
}

// --- 5. ANALYSIS LOGIC ---

function renderAnalysis(ticker) {
    const data = MOCK_DB[ticker] || { name: ticker, price: 100.00, change: 0.00 };
    
    // Update Header
    document.getElementById('analysis-name').innerText = data.name;
    document.getElementById('analysis-ticker').innerText = ticker;
    document.getElementById('analysis-price').innerText = data.currency === 'KRW' ? `₩${data.price.toLocaleString()}` : `$${data.price}`;
    
    const changeEl = document.getElementById('analysis-change');
    changeEl.innerText = `${data.change >= 0 ? '+' : ''}${data.change}%`;
    changeEl.className = `price-change ${data.change >= 0 ? 'text-up' : 'text-down'}`;

    // Reset Tabs to first one
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
    // UI Toggle
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');

    // Load Tab Content
    const ticker = STATE.ticker;
    if (tabId === 'chart') loadAdvancedChart(ticker);
    if (tabId === 'compare') loadComparisonChart(ticker);
    if (tabId === 'financials') loadFinancials(ticker);
    if (tabId === 'news') loadNews(ticker);
    if (tabId === 'simulator') loadSimulator(ticker);
}

// --- 5.1 Advanced Chart ---
function loadAdvancedChart(ticker) {
    if (STATE.charts.main) STATE.charts.main.destroy();

    const data = generateOHLC(90, MOCK_DB[ticker]?.price || 100);
    
    const options = {
        series: [{
            name: 'candle',
            type: 'candlestick',
            data: data
        }],
        chart: {
            type: 'candlestick',
            height: 400,
            background: 'transparent',
            toolbar: { show: false }
        },
        theme: { mode: 'dark' },
        stroke: { width: 1 },
        xaxis: { type: 'datetime' },
        yaxis: { tooltip: { enabled: true } },
        grid: { borderColor: '#334155' }
    };

    const chart = new ApexCharts(document.querySelector("#main-candlestick-chart"), options);
    chart.render();
    STATE.charts.main = chart;
}

// --- 5.2 Comparison ---
function loadComparisonChart(ticker) {
    const compInput = document.getElementById('compare-ticker-input');
    const compBtn = document.getElementById('run-compare-btn');
    
    // Handler for button (remove old listeners to avoid dupes if any - simplified here)
    compBtn.onclick = () => {
        const competitor = compInput.value.toUpperCase();
        renderComparison(ticker, competitor);
    };

    // Initial Render
    renderComparison(ticker, compInput.value);
}

function renderComparison(tickerA, tickerB) {
    if (STATE.charts.compare) STATE.charts.compare.destroy();

    const dataA = generateLineData(365, 100);
    const dataB = generateLineData(365, 100);

    // Normalize to percentage return
    const normalize = (arr) => {
        const start = arr[0].y;
        return arr.map(d => ({ x: d.x, y: ((d.y - start) / start) * 100 }));
    };

    const options = {
        series: [
            { name: tickerA, data: normalize(dataA) },
            { name: tickerB, data: normalize(dataB) }
        ],
        chart: { type: 'line', height: 400, background: 'transparent', toolbar: { show: false } },
        theme: { mode: 'dark' },
        stroke: { width: 2, curve: 'smooth' },
        colors: ['#ef4444', '#3b82f6'],
        xaxis: { type: 'datetime' },
        yaxis: { labels: { formatter: (val) => val.toFixed(1) + '%' } },
        grid: { borderColor: '#334155' }
    };

    const chart = new ApexCharts(document.querySelector("#comparison-chart"), options);
    chart.render();
    STATE.charts.compare = chart;
}

// --- 5.3 Financials ---
function loadFinancials(ticker) {
    // Mock Data Update
    const mktCap = (Math.random() * 2 + 0.5).toFixed(1); // 0.5T - 2.5T
    const per = (Math.random() * 50 + 20).toFixed(1);
    const rev = (Math.random() * 50 + 10).toFixed(1);

    document.getElementById('fin-mkt-cap').innerText = `$${mktCap}T`;
    document.getElementById('fin-per').innerText = per;
    document.getElementById('fin-rev').innerText = `+${rev}%`;

    // Target Price
    const currentPrice = MOCK_DB[ticker]?.price || 100;
    const target = (currentPrice * 1.15).toFixed(2);
    document.getElementById('fin-target').innerText = `$${target}`;
}

// --- 5.4 News & Sentiment ---
function loadNews(ticker) {
    const feed = document.getElementById('news-feed');
    feed.innerHTML = '';

    const templates = [
        { text: "surges to record highs after earnings beat", type: 'pos' },
        { text: "faces regulatory headwinds in Europe", type: 'neg' },
        { text: "announces new strategic partnership with Google", type: 'pos' },
        { text: "production halted due to supply chain issues", type: 'neg' },
        { text: "analysts upgrade rating to Overweight", type: 'pos' }
    ];

    // Generate 5 random news items
    for (let i = 0; i < 5; i++) {
        const item = templates[Math.floor(Math.random() * templates.length)];
        const timeAgo = Math.floor(Math.random() * 12) + 1;
        
        const div = document.createElement('div');
        div.className = 'news-item';
        div.innerHTML = `
            <div>
                <div class="news-meta">${timeAgo} hours ago • Business Wire</div>
                <div class="news-title">${ticker} ${item.text}</div>
            </div>
            <span class="sentiment-badge ${item.type === 'pos' ? 'sentiment-pos' : 'sentiment-neg'}">
                ${item.type === 'pos' ? 'Positive' : 'Negative'}
            </span>
        `;
        feed.appendChild(div);
    }
}

// --- 5.5 Simulator (DCA) ---
function setupSimulators() {
    document.getElementById('run-sim-btn').addEventListener('click', () => {
        loadSimulator(STATE.ticker, true);
    });
}

function loadSimulator(ticker, isRun = false) {
    const amount = parseFloat(document.getElementById('sim-amount').value);
    const durationYears = parseInt(document.getElementById('sim-duration').value);
    
    // Simulate Data
    const months = durationYears * 12;
    const historicalData = generateLineData(months * 30, 100); // Daily data roughly
    
    // Pick one data point per month
    let totalInvested = 0;
    let totalShares = 0;
    const assetGrowth = [];

    // Filter to monthly points
    const monthlyPoints = historicalData.filter((_, i) => i % 30 === 0).slice(0, months);

    monthlyPoints.forEach((point, i) => {
        totalInvested += amount;
        const sharesBought = amount / point.y;
        totalShares += sharesBought;
        
        assetGrowth.push({
            x: point.x,
            y: totalShares * point.y
        });
    });

    const finalValue = totalShares * monthlyPoints[monthlyPoints.length - 1].y;
    const yieldPercent = ((finalValue - totalInvested) / totalInvested) * 100;

    // Update UI
    document.getElementById('sim-invested').innerText = `$${totalInvested.toLocaleString()}`;
    document.getElementById('sim-final').innerText = `$${Math.round(finalValue).toLocaleString()}`;
    document.getElementById('sim-yield').innerText = `${yieldPercent > 0 ? '+' : ''}${yieldPercent.toFixed(1)}%`;

    // Render Chart
    if (STATE.charts.sim) STATE.charts.sim.destroy();

    const options = {
        series: [{ name: 'Portfolio Value', data: assetGrowth }],
        chart: { type: 'area', height: 350, background: 'transparent', toolbar: { show: false } },
        theme: { mode: 'dark' },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#22c55e'],
        fill: { opacity: 0.3, type: 'gradient' },
        xaxis: { type: 'datetime' },
        yaxis: { labels: { formatter: (val) => '$' + Math.round(val) } },
        grid: { borderColor: '#334155' }
    };

    const chart = new ApexCharts(document.querySelector("#simulator-chart"), options);
    chart.render();
    STATE.charts.sim = chart;
}

// Global scope export for HTML onClick handlers
window.router = router;