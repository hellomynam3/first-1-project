import { stocks, news, appSettings } from './store.js';
import { formatCurrency, formatNumber, getGrade } from './utils.js';
import { runMonteCarlo, calculateRSI, calculateSMA, calculateBollingerBands, generateHistory } from './math.js';
import { fetchGeminiAnalysis } from './api.js';

export function renderStockDetail(container, symbol, onBack) {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;

    const isUp = stock.change >= 0;
    const colorClass = isUp ? 'text-green' : 'text-red';
    const grade = getGrade(stock);
    const gradeColor = grade === 'S' ? '#d946ef' : grade === 'A' ? '#10b981' : grade === 'B' ? '#f59e0b' : '#ef4444';

    // Filter relevant news
    const stockNews = news.slice(0, 3);

    container.innerHTML = `
        <button class="back-button" id="btn-back"><i class="fa-solid fa-arrow-left"></i> Back to Dashboard</button>
        
        <!-- 1. Top Hero Section: Identity & Price -->
        <div class="glass-panel" style="padding: 24px; margin-bottom: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
                <div>
                    <h1 style="font-size: 2.8rem; margin-bottom: 5px;">${stock.symbol}</h1>
                    <div style="font-size: 1.2rem; color: var(--text-secondary);">${stock.name} • ${stock.sector}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 3rem; font-weight: bold;">$${stock.price.toFixed(2)}</div>
                    <div class="${colorClass}" style="font-size: 1.4rem; font-weight:bold;">
                        ${isUp ? '▲' : '▼'} ${Math.abs(stock.change)}%
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. Main Visual & Core Stats -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px;">
            <!-- Price Chart -->
            <div class="glass-panel" style="padding: 20px; min-height: 400px; display:flex; flex-direction:column;">
                <div class="section-title"><i class="fa-solid fa-chart-area"></i> 30-Day Price Trend</div>
                <div style="flex:1;">
                    <canvas id="detailChart"></canvas>
                </div>
            </div>

            <!-- Health & Quick Stats -->
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div class="glass-panel" style="padding: 20px; text-align:center;">
                    <div class="section-title" style="justify-content:center;">Quant Grade</div>
                    <div style="font-size: 5rem; font-weight: bold; color: ${gradeColor}; line-height:1; margin: 10px 0;">${grade}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Financial Health Score</div>
                </div>
                
                <div class="glass-panel" style="padding: 20px; flex:1;">
                    <div class="section-title">Key Metrics</div>
                    <div style="display:grid; gap:15px;">
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:var(--text-secondary);">Market Cap</span>
                            <strong>${stock.marketCap ? formatCurrency(stock.marketCap) : 'N/A'}</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:var(--text-secondary);">P/E Ratio</span>
                            <strong>${stock.peRatio || 'N/A'}</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:var(--text-secondary);">ROE</span>
                            <strong class="text-green">${stock.roe}%</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:var(--text-secondary);">Debt Ratio</span>
                            <strong class="${stock.debtRatio > 100 ? 'text-red' : ''}">${stock.debtRatio}%</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:var(--text-secondary);">Dividend</span>
                            <strong>${stock.dividend || 0}%</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. AI & Deep Analysis Section -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <!-- Technical Signals -->
            <div class="glass-panel" style="padding: 20px;">
                <div class="section-title"><i class="fa-solid fa-bolt"></i> Technical Signals</div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                    <div class="metric-item">
                        <div class="metric-label">RSI (14)</div>
                        <div class="metric-val" id="val-rsi">--</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Trend</div>
                        <div class="metric-val" id="val-trend">--</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">SMA (20)</div>
                        <div class="metric-val" id="val-sma">--</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">BB Status</div>
                        <div class="metric-val" id="val-bb">--</div>
                    </div>
                </div>
                <button id="btn-ai-analysis" style="width:100%; margin-top:20px; padding:12px; background:linear-gradient(45deg, #6366f1, #a855f7); border:none; border-radius:8px; color:white; font-weight:bold; cursor:pointer;">
                    <i class="fa-solid fa-robot"></i> Generate AI Strategy Report
                </button>
            </div>

            <!-- AI Summary/Output -->
            <div class="glass-panel" style="padding: 20px; position:relative;">
                <div class="section-title"><i class="fa-solid fa-brain"></i> AI Insight</div>
                <div id="ai-analysis-output">
                    <p style="font-size: 1rem; line-height: 1.6; color: #ddd;" id="ai-text">
                        "${stock.description}"
                        <br><br>
                        <span style="color:var(--text-secondary); font-size:0.9rem;">Click the button to the left for a deep quantitative analysis powered by Gemini AI.</span>
                    </p>
                </div>
            </div>
        </div>

        <!-- 4. Advanced Tools -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <!-- Monte Carlo -->
            <div class="glass-panel" style="padding: 20px;">
                <div class="section-title"><i class="fa-solid fa-dice"></i> Monte Carlo Projection (30 Days)</div>
                <div style="height:250px;">
                    <canvas id="monteCarloChart"></canvas>
                </div>
            </div>

            <!-- DCA Calc -->
            <div class="glass-panel" style="padding: 20px;">
                <div class="section-title"><i class="fa-solid fa-calculator"></i> Savings Simulator (DCA)</div>
                <div style="display:grid; gap:15px;">
                    <div style="display:flex; gap:10px;">
                        <div style="flex:1;">
                            <label style="font-size:0.8rem; color:var(--text-secondary);">Monthly Investment ($)</label>
                            <input type="number" id="dca-amount" value="500" class="styled-input" style="width:100%;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.8rem; color:var(--text-secondary);">Years</label>
                            <input type="number" id="dca-years" value="3" class="styled-input" style="width:100%;">
                        </div>
                    </div>
                    <button id="calc-dca" class="action-btn" style="padding:12px;">Run Simulation</button>
                    <div id="dca-result" style="padding:15px; background:rgba(0,0,0,0.2); border-radius:8px; min-height:80px;"></div>
                </div>
            </div>
        </div>

        <!-- 5. News Section -->
        <div class="glass-panel" style="padding: 24px;">
            <div class="section-title"><i class="fa-regular fa-newspaper"></i> Latest Market Intelligence</div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px;">
                ${stockNews.map(n => `
                    <div style="padding: 15px; background: rgba(255,255,255,0.03); border-radius:12px; border-left: 4px solid var(--accent-blue);">
                        <div style="font-size: 1rem; font-weight: bold; margin-bottom: 8px; line-height:1.4;">${n.title}</div>
                        <div style="display:flex; justify-content:space-between; font-size: 0.8rem; color: var(--text-secondary);">
                            <span>${n.source}</span>
                            <span class="sentiment-badge ${n.sentiment}">${n.sentiment.toUpperCase()}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Event Listeners
    document.getElementById('btn-back').addEventListener('click', onBack);
    document.getElementById('calc-dca').addEventListener('click', () => calculateDCA(stock));
    document.getElementById('btn-ai-analysis').addEventListener('click', () => runAIAnalysis(stock));

    // Render Components
    renderDetailChart(stock);
    updateTechnicalAnalysis(stock);
    renderMonteCarlo(stock);
}

function renderDetailChart(stock) {
    const ctx = document.getElementById('detailChart').getContext('2d');
    const history = generateHistory(stock.price, 30);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: history.length}, (_, i) => i),
            datasets: [{
                label: 'Price',
                data: history,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
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
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function updateTechnicalAnalysis(stock) {
    const history = generateHistory(stock.price, 30);
    
    // RSI
    const rsi = calculateRSI(history, 14);
    const rsiEl = document.getElementById('val-rsi');
    rsiEl.textContent = rsi.toFixed(1);
    rsiEl.style.color = rsi > 70 ? 'var(--accent-red)' : rsi < 30 ? 'var(--accent-green)' : 'white';

    // SMA
    const sma = calculateSMA(history, 20);
    document.getElementById('val-sma').textContent = sma ? `$${sma.toFixed(2)}` : '--';

    // Bollinger
    const bb = calculateBollingerBands(history, 20);
    const bbEl = document.getElementById('val-bb');
    let bbStatus = "Normal";
    if (bb) {
        if (stock.price > bb.upper) bbStatus = "Overbought";
        if (stock.price < bb.lower) bbStatus = "Oversold";
    }
    bbEl.textContent = bbStatus;
    bbEl.style.color = bbStatus !== "Normal" ? 'var(--accent-yellow)' : 'white';

    // Trend
    const trendEl = document.getElementById('val-trend');
    if (sma) {
        const isBullish = stock.price > sma;
        trendEl.textContent = isBullish ? "Bullish" : "Bearish";
        trendEl.style.color = isBullish ? 'var(--accent-green)' : 'var(--accent-red)';
    }
}

async function runAIAnalysis(stock) {
    const textDiv = document.getElementById('ai-text');
    const btn = document.getElementById('btn-ai-analysis');

    textDiv.innerHTML = `
        <div style="text-align:center; padding: 40px 0;">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--accent-blue);"></i>
            <p style="margin-top:15px;">Quant AI is calculating multi-factor strategy...</p>
        </div>
    `;
    btn.disabled = true;

    try {
        const prompt = `Act as a professional quantitative analyst. Analyze ${stock.name} (${stock.symbol}). 
        Price: $${stock.price}, ROE: ${stock.roe}%, Margin: ${stock.profitMargin}%, Debt: ${stock.debtRatio}%. 
        Provide Headings for: 1. Fundamentals, 2. Risk Check, 3. Rating. Keep it concise.`;

        const analysis = await fetchGeminiAnalysis(prompt);
        textDiv.innerHTML = `
            <div style="animation: fadeIn 0.5s ease; color: #f8fafc;">
                ${analysis.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--accent-blue)">$1</strong>')}
            </div>
        `;
    } catch (e) {
        textDiv.innerHTML = `
            <div style="padding:20px; background:rgba(239,68,68,0.1); border-radius:8px; color:var(--accent-red);">
                <strong>Analysis Failed</strong><br>
                ${e.message}<br><br>
                Please ensure your Gemini API Key is valid in Settings.
            </div>
        `;
    } finally {
        btn.disabled = false;
    }
}

function renderMonteCarlo(stock) {
    const ctx = document.getElementById('monteCarloChart').getContext('2d');
    const paths = runMonteCarlo(stock.price, stock.volatility, 30, 12);
    
    const datasets = paths.map(path => ({
        data: path,
        borderColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        tension: 0.4
    }));

    const avgPath = paths[0].map((_, col) => paths.reduce((acc, row) => acc + row[col], 0) / paths.length);
    datasets.push({
        data: avgPath,
        borderColor: 'var(--accent-yellow)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 31}, (_, i) => i),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function calculateDCA(stock) {
    const amount = parseFloat(document.getElementById('dca-amount').value);
    const years = parseFloat(document.getElementById('dca-years').value);
    const resultEl = document.getElementById('dca-result');

    const months = years * 12;
    let totalValue = 0;
    let totalInvested = amount * months;
    const annualReturn = 0.08; 
    
    for (let i = 0; i < months; i++) {
        totalValue = (totalValue + amount) * (1 + annualReturn/12);
    }

    const profit = totalValue - totalInvested;
    const profitPercent = (profit / totalInvested) * 100;

    resultEl.innerHTML = `
        <div style="font-size:1rem; display:grid; gap:8px;">
            <div style="display:flex; justify-content:space-between; opacity:0.8;"><span>Total Invested</span> <span>$${totalInvested.toLocaleString()}</span></div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;"><span>Est. Final Value</span> <strong style="color:var(--accent-green);">$${totalValue.toLocaleString(undefined, {maximumFractionDigits:0})}</strong></div>
            <div style="display:flex; justify-content:space-between; font-weight:bold;"><span>Total Profit</span> <span style="color:var(--accent-green);">+$${profit.toLocaleString(undefined, {maximumFractionDigits:0})} (${profitPercent.toFixed(1)}%)</span></div>
        </div>
    `;
}
