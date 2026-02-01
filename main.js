/**
 * Stock AI Pro - TradingView Style Logic
 */

// --- STATE ---
const STATE = {
    symbol: 'BTC/USD',
    price: 65432.10,
    chart: null,
    interval: null
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    initTickerTape();
    renderWatchlist();
    initChart();
    startRealtimeSimulation();
    renderNews();
});

// --- 1. TICKER TAPE ---
function initTickerTape() {
    const indices = [
        { name: 'S&P 500', val: 5123.4, chg: 0.5 },
        { name: 'NASDAQ', val: 16300.2, chg: 0.8 },
        { name: 'DOW JONES', val: 39100.5, chg: -0.2 },
        { name: 'KOSPI', val: 2680.1, chg: 1.2 },
        { name: 'NIKKEI', val: 39500.0, chg: 0.4 },
        { name: 'BTC/USD', val: 65432.1, chg: 2.1 },
        { name: 'ETH/USD', val: 3500.5, chg: 1.5 }
    ];

    const tape = document.getElementById('ticker-wrap');
    const items = indices.map(idx => {
        const colorClass = idx.chg >= 0 ? 'up' : 'down';
        const sign = idx.chg >= 0 ? '+' : '';
        return `<div class="ticker-item">
            <span style="font-weight:700">${idx.name}</span> 
            <span class="${colorClass}">${idx.val} (${sign}${idx.chg}%)</span>
        </div>`;
    }).join('');

    // Duplicate for infinite scroll effect
    tape.innerHTML = items + items + items;
}

// --- 2. WATCHLIST ---
function renderWatchlist() {
    const list = [
        { s: 'NVDA', n: 'NVIDIA Corp', p: 880.2, c: 3.5 },
        { s: 'AAPL', n: 'Apple Inc', p: 172.5, c: -0.5 },
        { s: 'TSLA', n: 'Tesla Inc', p: 175.4, c: -1.2 },
        { s: 'AMD', n: 'Adv Micro Dev', p: 180.1, c: 2.1 },
        { s: 'MSTR', n: 'MicroStrategy', p: 1500.0, c: 10.5 },
        { s: 'COIN', n: 'Coinbase', p: 240.2, c: 5.4 },
        { s: 'GOOGL', n: 'Alphabet A', p: 140.5, c: 0.2 },
        { s: 'AMZN', n: 'Amazon.com', p: 178.2, c: 0.8 },
        { s: 'MSFT', n: 'Microsoft', p: 420.1, c: 1.1 }
    ];

    const container = document.getElementById('watchlist-container');
    container.innerHTML = list.map(item => {
        const color = item.c >= 0 ? 'text-up' : 'text-down';
        const sign = item.c >= 0 ? '+' : '';
        return `
            <div class="watchlist-item" onclick="switchSymbol('${item.s}')">
                <div>
                    <span class="wl-symbol">${item.s}</span>
                    <span class="wl-name">${item.n}</span>
                </div>
                <div>
                    <div class="wl-price">${item.p.toFixed(2)}</div>
                    <div class="wl-change ${color}" style="background: ${item.c >= 0 ? 'rgba(8,153,129,0.1)' : 'rgba(242,54,69,0.1)'}">${sign}${item.c}%</div>
                </div>
            </div>
        `;
    }).join('');
}

window.switchSymbol = (sym) => {
    STATE.symbol = sym;
    document.getElementById('main-symbol').innerText = sym;
    // Real logic would fetch new data here
    STATE.chart.updateSeries([{ data: generateData(100) }]);
};

// --- 3. CHART (Pro Config) ---
function generateData(count) {
    let series = [];
    let price = STATE.price;
    let now = new Date().getTime();
    
    for(let i=count; i>0; i--) {
        const date = now - (i * 60000 * 15); // 15min bars
        const open = price;
        const close = price * (1 + (Math.random() * 0.02 - 0.01));
        const high = Math.max(open, close) * (1 + Math.random() * 0.005);
        const low = Math.min(open, close) * (1 - Math.random() * 0.005);
        
        series.push({
            x: date,
            y: [open, high, low, close].map(n => parseFloat(n.toFixed(2)))
        });
        price = close;
    }
    STATE.price = price; // Sync current price
    return series;
}

function initChart() {
    const options = {
        series: [{ data: generateData(100) }],
        chart: {
            type: 'candlestick',
            height: '100%',
            background: '#131722',
            toolbar: { show: true, tools: { download: false } },
            animations: { enabled: false } // Pro performance
        },
        theme: { mode: 'dark' },
        grid: {
            borderColor: '#363a45',
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            type: 'datetime',
            tooltip: { enabled: false },
            axisBorder: { color: '#363a45' },
            axisTicks: { color: '#363a45' }
        },
        yaxis: {
            tooltip: { enabled: true },
            opposite: true, // Right side axis like TradingView
            labels: { formatter: val => val.toFixed(2) }
        },
        plotOptions: {
            candlestick: {
                colors: { upward: '#089981', downward: '#f23645' },
                wick: { useFillColor: true }
            }
        }
    };

    STATE.chart = new ApexCharts(document.querySelector("#pro-candlestick-chart"), options);
    STATE.chart.render();
}

// --- 4. REALTIME SIMULATION (Order Book) ---
function startRealtimeSimulation() {
    setInterval(() => {
        updateOrderBook();
        updatePriceRandomly();
    }, 1000); // 1s refresh
}

function updatePriceRandomly() {
    // Random walk
    const move = (Math.random() - 0.5) * (STATE.price * 0.001);
    STATE.price += move;
    
    // Update Header
    document.getElementById('main-price').innerText = STATE.price.toFixed(2);
    document.getElementById('ob-current-price').innerText = `${STATE.price.toFixed(2)} USD`;
    
    // Color flash
    const priceEl = document.getElementById('main-price');
    priceEl.style.color = move >= 0 ? '#089981' : '#f23645';
}

function updateOrderBook() {
    const asksContainer = document.getElementById('ob-asks');
    const bidsContainer = document.getElementById('ob-bids');
    
    // Generate simulated depth around current price
    let asksHtml = '';
    let bidsHtml = '';
    
    // 5 Asks (above price)
    for(let i=5; i>0; i--) {
        const p = STATE.price + (i * 0.5);
        const size = (Math.random() * 2).toFixed(4);
        const total = (p * parseFloat(size)).toFixed(0);
        // Using inline style for "depth bar" visual could be cool but skipped for brevity
        asksHtml += `
            <div class="ob-row">
                <div class="ob-col price text-down">${p.toFixed(2)}</div>
                <div class="ob-col">${size}</div>
                <div class="ob-col" style="color:#787b86">${total}</div>
            </div>`;
    }

    // 5 Bids (below price)
    for(let i=1; i<=5; i++) {
        const p = STATE.price - (i * 0.5);
        const size = (Math.random() * 2).toFixed(4);
        const total = (p * parseFloat(size)).toFixed(0);
        bidsHtml += `
            <div class="ob-row">
                <div class="ob-col price text-up">${p.toFixed(2)}</div>
                <div class="ob-col">${size}</div>
                <div class="ob-col" style="color:#787b86">${total}</div>
            </div>`;
    }

    asksContainer.innerHTML = asksHtml;
    bidsContainer.innerHTML = bidsHtml;
}

// --- 5. NEWS ---
function renderNews() {
    const news = [
        { t: '12:05', h: 'Bitcoin breaks $65k resistance level' },
        { t: '11:45', h: 'SEC delays ETF decision again' },
        { t: '10:30', h: 'MicroStrategy buys another 3000 BTC' },
        { t: '09:15', h: 'Fed Chair Powell speech highlights inflation risks' },
        { t: '08:00', h: 'Market opens with strong momentum' }
    ];
    
    document.getElementById('news-container').innerHTML = news.map(n => `
        <div class="news-row">
            <div class="news-time">${n.t}</div>
            <div class="news-headline">${n.h}</div>
        </div>
    `).join('');
}