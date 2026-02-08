import { stocks, appSettings } from './store.js';
import { runMonteCarlo, calculateRSI, calculateSMA, calculateBollingerBands, generateHistory } from './math.js';
import { getGrade } from './utils.js';
import { fetchGeminiAnalysis } from './api.js';

export function renderSimulator(container) {
    const selectedStock = stocks[0]; // Default NVDA

    container.innerHTML = `
        <div class="quant-grid">
            <!-- Health Score -->
            <div class="glass-panel" style="padding:20px;">
                <div class="section-title"><i class="fa-solid fa-stethoscope"></i> Financial Health Score</div>
                <div style="display:flex; align-items:center; gap:20px; margin-bottom:20px;">
                    <div style="font-size:4rem; font-weight:bold; color:var(--accent-yellow);" id="health-grade">A</div>
                    <div style="flex:1;">
                        <div class="metric-grid">
                            <div class="metric-item">
                                <div class="metric-label">ROE</div>
                                <div class="metric-val" id="val-roe"></div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-label">Profit Margin</div>
                                <div class="metric-val" id="val-margin"></div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-label">Debt Ratio</div>
                                <div class="metric-val" id="val-debt"></div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-label">Analyst Rating</div>
                                <div class="metric-val" id="val-rating"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <label>Select Stock:</label>
                    <select id="sim-stock-select" style="background:#333; color:white; padding:8px; border-radius:8px; width:100%;">
                        ${stocks.filter(s => !s.type).map(s => `<option value="${s.symbol}">${s.symbol} - ${s.name}</option>`).join('')}
                    </select>
                </div>
            </div>

            <!-- Technical Analysis -->
            <div class="glass-panel" style="padding:20px;">
                <div class="section-title"><i class="fa-solid fa-chart-line"></i> Technical Analysis (AI Estimates)</div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                    <div class="metric-item">
                        <div class="metric-label">RSI (14)</div>
                        <div class="metric-val" id="val-rsi">--</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Bollinger Band</div>
                        <div class="metric-val" id="val-bb">--</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">SMA (20)</div>
                        <div class="metric-val" id="val-sma">--</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Trend Signal</div>
                        <div class="metric-val" id="val-trend">--</div>
                    </div>
                </div>
                
                <button id="btn-ai-analysis" style="width:100%; padding:10px; background:linear-gradient(45deg, #6b21a8, #c026d3); border:none; border-radius:8px; color:white; font-weight:bold; cursor:pointer;">
                    <i class="fa-solid fa-robot"></i> Ask AI for Deep Analysis
                </button>
            </div>
            
            <!-- AI Analysis Result Modal/Area -->
            <div id="ai-analysis-output" class="glass-panel hidden" style="grid-column: span 2; padding:20px; margin-top:0; border: 1px solid var(--accent-purple);">
                <div class="section-title"><i class="fa-solid fa-brain"></i> AI Strategy Report</div>
                <div id="ai-text" style="line-height:1.6; color:#e5e7eb; white-space: pre-line;"></div>
            </div>

            <!-- DCA Calculator -->
            <div class="glass-panel" style="padding:20px;">
                <div class="section-title"><i class="fa-solid fa-calculator"></i> DCA Calculator</div>
                <div style="display:grid; gap:12px;">
                    <label>Monthly Investment ($)</label>
                    <input type="number" id="dca-amount" value="500" style="background:#333; border:1px solid #555; color:white; padding:10px; border-radius:8px;">
                    <label>Duration (Years)</label>
                    <input type="number" id="dca-years" value="3" style="background:#333; border:1px solid #555; color:white; padding:10px; border-radius:8px;">
                    <button id="calc-dca" style="background:var(--accent-blue); border:none; padding:12px; color:white; border-radius:8px; cursor:pointer; font-weight:bold;">Calculate Return</button>
                    <div id="dca-result" style="margin-top:10px; padding:10px; background:rgba(255,255,255,0.05); border-radius:8px;"></div>
                </div>
            </div>
        </div>

        <!-- Monte Carlo -->
        <div class="glass-panel chart-container" style="margin-top:20px;">
            <div class="section-title"><i class="fa-solid fa-dice"></i> Monte Carlo Simulation (1 Year Forecast)</div>
            <canvas id="monteCarloChart"></canvas>
        </div>
    `;

    const select = document.getElementById('sim-stock-select');
    select.addEventListener('change', (e) => updateView(e.target.value));
    
    document.getElementById('calc-dca').addEventListener('click', calculateDCA);
    document.getElementById('btn-ai-analysis').addEventListener('click', () => runAIAnalysis(select.value));

    // Initial Render
    updateView(selectedStock.symbol);
}

function updateView(symbol) {
    const stock = stocks.find(s => s.symbol === symbol);
    
    // Update Grade
    const grade = getGrade(stock);
    const gradeEl = document.getElementById('health-grade');
    gradeEl.textContent = grade;
    gradeEl.style.color = grade === 'S' ? '#d946ef' : grade === 'A' ? '#10b981' : grade === 'B' ? '#f59e0b' : '#ef4444';
    
    document.getElementById('val-roe').textContent = `${stock.roe}%`;
    document.getElementById('val-margin').textContent = `${stock.profitMargin}%`;
    document.getElementById('val-debt').textContent = `${stock.debtRatio}%`;
    
    const ratingEl = document.getElementById('val-rating');
    ratingEl.textContent = stock.analystRating;
    ratingEl.style.color = stock.analystRating.includes('Buy') ? 'var(--accent-green)' : 'var(--text-secondary)';

    // Update Technical Analysis (Mock Data based on price)
    updateTechnicalAnalysis(stock);

    // Run Monte Carlo
    renderMonteCarlo(stock);

    // Hide AI Output on stock change
    document.getElementById('ai-analysis-output').classList.add('hidden');
}

function updateTechnicalAnalysis(stock) {
    // Generate mock history since we don't have real full history in this demo
    // In a real app, this would come from the API
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

async function runAIAnalysis(symbol) {
    const outputDiv = document.getElementById('ai-analysis-output');
    const textDiv = document.getElementById('ai-text');
    const btn = document.getElementById('btn-ai-analysis');
    const stock = stocks.find(s => s.symbol === symbol);

    outputDiv.classList.remove('hidden');
    textDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing market data with Gemini AI...';
    btn.disabled = true;

    try {
        const prompt = `Act as a professional quantitative analyst. 
        Analyze the stock ${stock.name} (${stock.symbol}). 
        Current Price: $${stock.price}. 
        ROE: ${stock.roe}%. 
        Profit Margin: ${stock.profitMargin}%. 
        Debt Ratio: ${stock.debtRatio}%. 
        
        Provide a concise analysis covering:
        1. Fundamental Health (Based on metrics provided)
        2. Potential Risks
        3. A "Buy", "Hold", or "Sell" rating with a brief justification.
        
        Keep it under 150 words. Format with clear headings.`;

        const analysis = await fetchGeminiAnalysis(prompt);
        
        // Convert **bold** to <strong> tags for simple formatting
        const formattedText = analysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        textDiv.innerHTML = formattedText;

    } catch (e) {
        textDiv.innerHTML = `<span style="color:#ef4444">Analysis Failed: ${e.message}. Check your API Key in Settings.</span>`;
    } finally {
        btn.disabled = false;
    }
}

function renderMonteCarlo(stock) {
    const ctx = document.getElementById('monteCarloChart').getContext('2d');
    
    if (window.myMonteChart) window.myMonteChart.destroy();

    const paths = runMonteCarlo(stock.price, stock.volatility, 30, 20); // 30 days, 20 sims
    const datasets = paths.map(path => ({
        data: path,
        borderColor: 'rgba(59, 130, 246, 0.15)',
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        tension: 0.4
    }));

    const avgPath = paths[0].map((_, colIndex) => paths.reduce((acc, row) => acc + row[colIndex], 0) / paths.length);
    datasets.push({
        label: 'Average Forecast',
        data: avgPath,
        borderColor: '#f59e0b',
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.4
    });

    window.myMonteChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 31}, (_, i) => `Day ${i}`),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function calculateDCA() {
    const amount = parseFloat(document.getElementById('dca-amount').value);
    const years = parseFloat(document.getElementById('dca-years').value);
    const resultEl = document.getElementById('dca-result');

    // Mock calculation assuming 10% annual return
    const months = years * 12;
    let totalValue = 0;
    let totalInvested = amount * months;
    
    for (let i = 0; i < months; i++) {
        totalValue = (totalValue + amount) * (1 + 0.10/12);
    }

    const profit = totalValue - totalInvested;
    const profitPercent = (profit / totalInvested) * 100;

    resultEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>Total Invested:</span>
            <strong>$${totalInvested.toLocaleString()}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>Final Value:</span>
            <strong style="color:var(--accent-green)">$${totalValue.toLocaleString(undefined, {maximumFractionDigits:0})}</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
            <span>Total Return:</span>
            <strong style="color:var(--accent-green)">+${profitPercent.toFixed(1)}%</strong>
        </div>
    `;
}
