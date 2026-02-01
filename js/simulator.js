import { stocks, runMonteCarlo, getGrade } from './data.js';

export function renderSimulator(container) {
    const selectedStock = stocks[0]; // Default NVDA

    container.innerHTML = `
        <div class="quant-grid">
            <!-- Health Score -->
            <div class="glass-panel" style="padding:20px;">
                <div class="section-title"><i class="fa-solid fa-stethoscope"></i> Financial Health Score</div>
                <div style="display:flex; align-items:center; gap:20px;">
                    <div style="font-size:4rem; font-weight:bold; color:var(--accent-yellow);" id="health-grade">A</div>
                    <div>
                        <div>ROE: <span id="val-roe"></span>%</div>
                        <div>Profit Margin: <span id="val-margin"></span>%</div>
                        <div>Debt Ratio: <span id="val-debt"></span>%</div>
                    </div>
                </div>
                <div style="margin-top:20px;">
                    <label>Select Stock:</label>
                    <select id="sim-stock-select" style="background:#333; color:white; padding:5px; border-radius:5px;">
                        ${stocks.filter(s => !s.type).map(s => `<option value="${s.symbol}">${s.symbol}</option>`).join('')}
                    </select>
                </div>
            </div>

            <!-- DCA Calculator -->
            <div class="glass-panel" style="padding:20px;">
                <div class="section-title"><i class="fa-solid fa-calculator"></i> DCA Calculator</div>
                <div style="display:grid; gap:10px;">
                    <label>Monthly Investment ($)</label>
                    <input type="number" id="dca-amount" value="500" style="background:#333; border:1px solid #555; color:white; padding:8px; border-radius:4px;">
                    <label>Duration (Years)</label>
                    <input type="number" id="dca-years" value="3" style="background:#333; border:1px solid #555; color:white; padding:8px; border-radius:4px;">
                    <button id="calc-dca" style="background:var(--accent-blue); border:none; padding:10px; color:white; border-radius:4px; cursor:pointer;">Calculate Return</button>
                    <div id="dca-result" style="margin-top:10px; font-weight:bold;"></div>
                </div>
            </div>
        </div>

        <!-- Monte Carlo -->
        <div class="glass-panel chart-container" style="margin-top:20px;">
            <div class="section-title"><i class="fa-solid fa-dice"></i> Monte Carlo Simulation (1 Year Forecast)</div>
            <canvas id="monteCarloChart"></canvas>
        </div>
    `;

    // Event Listeners
    const select = document.getElementById('sim-stock-select');
    select.addEventListener('change', (e) => updateView(e.target.value));
    
    document.getElementById('calc-dca').addEventListener('click', calculateDCA);

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
    
    document.getElementById('val-roe').textContent = stock.roe;
    document.getElementById('val-margin').textContent = stock.profitMargin;
    document.getElementById('val-debt').textContent = stock.debtRatio;

    // Run Monte Carlo
    renderMonteCarlo(stock);
}

function renderMonteCarlo(stock) {
    const ctx = document.getElementById('monteCarloChart').getContext('2d');
    
    // Destroy old chart if exists (Chart.js limitation requires tracking instances, 
    // but for this simple prototype we might just clear canvas or accept overlap if not careful.
    // Better pattern: store chart instance on the canvas element)
    if (window.myMonteChart) window.myMonteChart.destroy();

    const paths = runMonteCarlo(stock.price, stock.volatility, 30, 20); // 30 days, 20 sims
    const datasets = paths.map(path => ({
        data: path,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 1,
        pointRadius: 0,
        fill: false
    }));

    // Add average line
    const avgPath = paths[0].map((_, colIndex) => paths.reduce((acc, row) => acc + row[colIndex], 0) / paths.length);
    datasets.push({
        label: 'Average Forecast',
        data: avgPath,
        borderColor: '#f59e0b',
        borderWidth: 3,
        pointRadius: 0
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
        Invested: $${totalInvested.toLocaleString()}<br>
        Final Value: <span style="color:#10b981">$${totalValue.toLocaleString(undefined, {maximumFractionDigits:0})}</span><br>
        Return: <span style="color:#10b981">+${profitPercent.toFixed(1)}%</span>
    `;
}
