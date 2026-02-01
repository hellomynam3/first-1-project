/**
 * Mock Data for Initial State
 */
const INDICES_DATA = [
    { id: 'kospi', name: 'KOSPI', price: 2650.45, change: 12.30, changePercent: 0.46 },
    { id: 'kosdaq', name: 'KOSDAQ', price: 870.12, change: -5.20, changePercent: -0.60 },
    { id: 'nasdaq', name: 'NASDAQ', price: 16200.50, change: 150.20, changePercent: 0.93 },
    { id: 'sp500', name: 'S&P 500', price: 5100.80, change: 25.40, changePercent: 0.50 }
];

const STOCKS_DATA = [
    { id: 'sec', name: '삼성전자', symbol: '005930', price: 74200, change: 500, changePercent: 0.68 },
    { id: 'skh', name: 'SK하이닉스', symbol: '000660', price: 145000, change: -1500, changePercent: -1.02 },
    { id: 'lgensol', name: 'LG에너지솔루션', symbol: '373220', price: 398000, change: 2000, changePercent: 0.51 },
    { id: 'apple', name: 'Apple', symbol: 'AAPL', price: 182.50, change: 1.20, changePercent: 0.66, currency: '$' },
    { id: 'tesla', name: 'Tesla', symbol: 'TSLA', price: 205.60, change: -4.50, changePercent: -2.14, currency: '$' },
    { id: 'nvidia', name: 'NVIDIA', symbol: 'NVDA', price: 820.40, change: 20.10, changePercent: 2.51, currency: '$' },
    { id: 'kakao', name: '카카오', symbol: '035720', price: 54300, change: 300, changePercent: 0.56 },
    { id: 'naver', name: 'NAVER', symbol: '035420', price: 201500, change: -1000, changePercent: -0.49 }
];

/**
 * Utility Functions
 */
function formatNumber(num, currency = '₩') {
    if (currency === '₩') {
        return num.toLocaleString('ko-KR');
    }
    return num.toFixed(2);
}

function getChangeColorClass(change) {
    if (change > 0) return 'text-up';
    if (change < 0) return 'text-down';
    return 'text-neutral';
}

function getChangeSign(change) {
    if (change > 0) return '▲';
    if (change < 0) return '▼';
    return '-';
}

/**
 * Web Component: Market Index
 */
class MarketIndex extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['price', 'change', 'change-percent'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
            this.triggerFlash(JSON.parse(newValue) > JSON.parse(oldValue));
        }
    }

    triggerFlash(isUp) {
        const card = this.shadowRoot.querySelector('.card');
        if (card) {
            card.classList.remove('flash-up', 'flash-down');
            void card.offsetWidth; // trigger reflow
            card.classList.add(isUp ? 'flash-up' : 'flash-down');
        }
    }

    render() {
        const name = this.getAttribute('name');
        const price = parseFloat(this.getAttribute('price'));
        const change = parseFloat(this.getAttribute('change'));
        const changePercent = parseFloat(this.getAttribute('change-percent'));

        const colorClass = getChangeColorClass(change);
        const sign = getChangeSign(change);

        this.shadowRoot.innerHTML = `
            <style>
                @import url('style.css');
            </style>
            <div class="card">
                <div class="card-header">
                    <span class="name">${name}</span>
                </div>
                <div class="price-container">
                    <span class="price ${colorClass}">${formatNumber(price, 'point')}</span>
                    <div class="change-container ${colorClass}">
                        <div>${sign} ${Math.abs(change).toFixed(2)}</div>
                        <div>(${changePercent.toFixed(2)}%)</div>
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('market-index', MarketIndex);

/**
 * Web Component: Stock Card
 */
class StockCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['price', 'change', 'change-percent'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
            // Simple logic: if price changed, flash. 
            // Ideally we check oldPrice vs newPrice but attrs are strings.
            // We'll trust the caller to update accurately or improve check later.
             if (name === 'price') {
                 const oldP = parseFloat(oldValue);
                 const newP = parseFloat(newValue);
                 if (!isNaN(oldP)) {
                    this.triggerFlash(newP > oldP);
                 }
             }
        }
    }

    triggerFlash(isUp) {
        const card = this.shadowRoot.querySelector('.card');
        if (card) {
            card.classList.remove('flash-up', 'flash-down');
            void card.offsetWidth;
            card.classList.add(isUp ? 'flash-up' : 'flash-down');
        }
    }

    render() {
        const name = this.getAttribute('name');
        const symbol = this.getAttribute('symbol');
        const currency = this.getAttribute('currency') || '₩';
        const price = parseFloat(this.getAttribute('price'));
        const change = parseFloat(this.getAttribute('change'));
        const changePercent = parseFloat(this.getAttribute('change-percent'));

        const colorClass = getChangeColorClass(change);
        const sign = getChangeSign(change);

        this.shadowRoot.innerHTML = `
            <style>
                @import url('style.css');
            </style>
            <div class="card">
                <div class="card-header">
                    <span class="name">${name}</span>
                    <span class="symbol">${symbol}</span>
                </div>
                <div class="price-container">
                    <span class="price ${colorClass}">${currency === '$' ? '$' : ''}${formatNumber(price, currency)}${currency === '₩' ? '원' : ''}</span>
                    <div class="change-container ${colorClass}">
                        <div>${sign} ${Math.abs(change).toLocaleString()}</div>
                        <div>(${changePercent.toFixed(2)}%)</div>
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('stock-card', StockCard);

/**
 * Application Logic
 */

// Initialize UI
const indicesContainer = document.getElementById('indices-container');
const stocksContainer = document.getElementById('stocks-container');

// State Maps to hold references to DOM elements
const indexElements = new Map();
const stockElements = new Map();

function init() {
    // Render Indices
    INDICES_DATA.forEach(data => {
        const el = document.createElement('market-index');
        el.setAttribute('name', data.name);
        el.setAttribute('price', data.price);
        el.setAttribute('change', data.change);
        el.setAttribute('change-percent', data.changePercent);
        indicesContainer.appendChild(el);
        indexElements.set(data.id, { el, data: { ...data } });
    });

    // Render Stocks
    STOCKS_DATA.forEach(data => {
        const el = document.createElement('stock-card');
        el.setAttribute('name', data.name);
        el.setAttribute('symbol', data.symbol);
        el.setAttribute('price', data.price);
        el.setAttribute('change', data.change);
        el.setAttribute('change-percent', data.changePercent);
        if (data.currency) el.setAttribute('currency', data.currency);
        stocksContainer.appendChild(el);
        stockElements.set(data.id, { el, data: { ...data } });
    });

    // Start Simulation
    startSimulation();
}

/**
 * Simulation Logic (Random Walk)
 */
function startSimulation() {
    setInterval(() => {
        // Randomly pick a few stocks to update
        stockElements.forEach((val, key) => {
            if (Math.random() > 0.6) { // 40% chance to update
                updateMarketItem(val);
            }
        });

        // Randomly pick indices to update
        indexElements.forEach((val, key) => {
            if (Math.random() > 0.7) {
                updateMarketItem(val);
            }
        });
    }, 2000); // Update every 2 seconds
}

function updateMarketItem(item) {
    const { el, data } = item;
    
    // Random fluctuation between -0.5% and +0.5%
    const volatility = 0.005; 
    const changeFactor = 1 + (Math.random() * volatility * 2 - volatility);
    
    // Update Price
    const oldPrice = data.price;
    let newPrice = oldPrice * changeFactor;
    
    // Rounding logic for clean numbers
    if (data.symbol && !data.currency) { // KRW Stocks (usually 100 won units or similar)
        if (newPrice > 100000) newPrice = Math.round(newPrice / 500) * 500;
        else if (newPrice > 10000) newPrice = Math.round(newPrice / 50) * 50;
        else newPrice = Math.round(newPrice / 10) * 10;
    } else { // Indices or USD stocks
        newPrice = Math.round(newPrice * 100) / 100;
    }

    // Calculate Change
    // We maintain a "base" price effectively, or just accumulative change.
    // For this simple mock, let's just update change based on the previous close (simulated).
    // Let's assume the previous close was roughly the initial mock data price / (1 + initial %).
    // To make it simpler visually: Change = NewPrice - (Price - OldChange)
    const previousClose = data.price - data.change; 
    const newChange = newPrice - previousClose;
    const newChangePercent = (newChange / previousClose) * 100;

    // Update Data Object
    data.price = newPrice;
    data.change = newChange;
    data.changePercent = newChangePercent;

    // Update DOM Attributes
    el.setAttribute('price', data.price);
    el.setAttribute('change', data.change);
    el.setAttribute('change-percent', data.changePercent);
}

// Kickoff
init();
