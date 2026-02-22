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

    // Filter relevant news (mock logic: just take first 2 + random)
    const stockNews = news.slice(0, 3);

    container.innerHTML = `
        <button class="back-button" id="btn-back"><i class="fa-solid fa-arrow-left"></i> Back to Dashboard</button>
        
        <div class="glass-panel" style="padding: 24px; margin-bottom: 24px;">
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
                        <div class="section-title"><i class="fa-solid fa-brain"></i> AI Summary</div>
                        <p style="margin-bottom: 10px; font-size: 0.9rem; line-height: 1.5;">
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

        <!-- Quant Tool Integration -->
        <div class="section-title" style="margin-top:40px;"><i class="fa-solid fa-microchip"></i> Quant Analysis Tool</div>
        <div class="quant-grid">
            <!-- Health Score -->
            <div class="glass-panel" style="padding:20px;">
                <div class="section-title"><i class="fa-solid fa-stethoscope"></i> Financial Health</div>
                <div style="display:flex; align-items:center; gap:20px;">
                    <div style="font-size:4rem; font-weight:bold; color:${gradeColor};" id="health-grade">${grade}</div>
                    <div style="flex:1;">
                        <div class="metric-grid">
                            <div class="metric-item">
                                <div class="metric-label">ROE</div>
                                <div class="metric-val">${stock.roe}%</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-label">Margin</div>
                                <div class="metric-val">${stock.profitMargin}%</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-label">Debt</div>
                                <div class="metric-val">${stock.debtRatio}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Technical Analysis -->
            <div class="glass-panel" style="padding:20px;">
                <div class="section-title"><i class="fa-solid fa-chart-line"></i> Technical Signals</div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                    <div class="metric-item">
                        <div class="metric-label">RSI (14)</div>
                        <div class="metric-val" id="val-rsi">--</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Trend</div>
                        <div class="metric-val" id="val-trend">--</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">BB Status</div>
                        <div class="metric-val" id="val-bb">--</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">SMA (20)</div>
                        <div class="metric-val" id="val-sma">--</div>
                    </div>
                </div>
                <button id="btn-ai-analysis" style="width:100%; padding:10px; background:linear-gradient(45deg, #6b21a8, #c026d3); border:none; border-radius:8px; color:white; font-weight:bold; cursor:pointer;">
                    <i class="fa-solid fa-robot"></i> Ask AI Strategy
                </button>
            </div>
            
            <div id="ai-analysis-output" class="glass-panel hidden" style="grid-column: span 2; padding:20px; border: 1px solid var(--accent-purple);">
                <div class="section-title"><i class="fa-solid fa-brain"></i> AI Strategy Report</div>
                <div id="ai-text" style="line-height:1.6; color:#e5e7eb; white-space: pre-line;"></div>
            </div>

            <!-- DCA Calculator -->
            <div class="glass-panel" style="padding:20px;">
                <div class="section-title"><i class="fa-solid fa-calculator"></i> DCA Calculator</div>
                <div style="display:grid; gap:12px;">
                    <div style="display:flex; gap:10px;">
                        <div style="flex:1;">
                            <label style="font-size:0.8rem; color:var(--text-secondary);">Monthly ($)</label>
                            <input type="number" id="dca-amount" value="500" class="styled-input" style="width:100%;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.8rem; color:var(--text-secondary);">Years</label>
                            <input type="number" id="dca-years" value="3" class="styled-input" style="width:100%;">
                        </div>
                    </div>
                    <button id="calc-dca" class="action-btn">Calculate Return</button>
                    <div id="dca-result" style="padding:10px; background:rgba(255,255,255,0.05); border-radius:8px; min-height:60px;"></div>
                </div>
            </div>

            <!-- Monte Carlo -->
            <div class="glass-panel chart-container" style="padding:20px; height:300px;">
                <div class="section-title"><i class="fa-solid fa-dice"></i> Monte Carlo Forecast</div>
                <canvas id="monteCarloChart"></canvas>
            </div>
        </div>
    `;

    document.getElementById('btn-back').addEventListener('click', onBack);
    document.getElementById('calc-dca').addEventListener('click', () => calculateDCA(stock));
    document.getElementById('btn-ai-analysis').addEventListener('click', () => runAIAnalysis(stock));

    // Render components
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

function updateTechnicalAnalysis(stock) {
    const history = generateHistory(stock.price, 30);
    
    // RSI
    const rsi = calculateRSI(history, 14);
    const rsiEl = document.getElementById('val-rsi');
    rsiEl.textContent = rsi.toFixed(1);
    rsiEl.style.color = rsi > 70 ? '#ef4444' : rsi < 30 ? '#10b981' : 'white';

    // SMA
    const sma = calculateSMA(history, 20);
    document.getElementById('val-sma').textContent = sma ? `$${sma.toFixed(2)}` : '--';

    // Bollinger
    const bb = calculateBollingerBands(history, 20);
    const bbEl = document.getElementById('val-bb');
    let bbStatus = "Normal";
    if (bb) {
        if (stock.price > bb.upper) bbStatus = "Upper Break";
        if (stock.price < bb.lower) bbStatus = "Lower Break";
    }
    bbEl.textContent = bbStatus;
    bbEl.style.color = bbStatus !== "Normal" ? '#f59e0b' : 'white';

    // Trend
    const trendEl = document.getElementById('val-trend');
    if (sma) {
        const trend = stock.price > sma ? "Bullish" : "Bearish";
        trendEl.textContent = trend;
        trendEl.style.color = trend === "Bullish" ? '#10b981' : '#ef4444';
    }
}

async function runAIAnalysis(stock) {
    const outputDiv = document.getElementById('ai-analysis-output');
    const textDiv = document.getElementById('ai-text');
    const btn = document.getElementById('btn-ai-analysis');

    outputDiv.classList.remove('hidden');
    textDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Running Quant AI Analysis...';
    btn.disabled = true;

    try {
        const prompt = `Act as a professional quantitative analyst. Analyze ${stock.name} (${stock.symbol}). 
        Price: $${stock.price}, ROE: ${stock.roe}%, Margin: ${stock.profitMargin}%, Debt: ${stock.debtRatio}%. 
        Provide Headings for: 1. Fundamentals, 2. Risk Check, 3. Rating.`;

        const analysis = await fetchGeminiAnalysis(prompt);
        textDiv.innerHTML = analysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    } catch (e) {
        textDiv.innerHTML = `<span style="color:#ef4444">Error: ${e.message}</span>`;
    } finally {
        btn.disabled = false;
    }
}

function renderMonteCarlo(stock) {
    const ctx = document.getElementById('monteCarloChart').getContext('2d');
    const paths = runMonteCarlo(stock.price, stock.volatility, 30, 15);
    
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
        borderColor: '#f59e0b',
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
                y: { grid: { color: 'rgba(255,255,255,0.05)' } }
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
    const annualReturn = 0.08; // Conservative 8%
    
    for (let i = 0; i < months; i++) {
        totalValue = (totalValue + amount) * (1 + annualReturn/12);
    }

    const profit = totalValue - totalInvested;
    const profitPercent = (profit / totalInvested) * 100;

    resultEl.innerHTML = `
        <div style="font-size:0.9rem; display:grid; gap:5px;">
            <div style="display:flex; justify-content:space-between;"><span>Invested:</span> <strong>$${totalInvested.toLocaleString()}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Est. Value:</span> <strong style="color:var(--accent-green)">$${totalValue.toLocaleString(undefined, {maximumFractionDigits:0})}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Return:</span> <strong style="color:var(--accent-green)">+${profitPercent.toFixed(1)}%</strong></div>
        </div>
    `;
}
