import { stocks } from './data.js';

export function renderBeginner(container) {
    container.innerHTML = `
        <div class="glass-panel beginner-card">
            <h2 style="margin-bottom:20px;">🔰 Easy Mode Stock Analysis</h2>
            
            <label>Choose a Stock to Learn About:</label>
            <select id="beg-stock-select" style="background:#333; color:white; padding:10px; border-radius:8px; width:100%; margin-top:10px; font-size:1.1rem;">
                ${stocks.filter(s => !s.type).map(s => `<option value="${s.symbol}">${s.name} (${s.symbol})</option>`).join('')}
            </select>
        </div>

        <div id="beginner-content"></div>
    `;

    const select = document.getElementById('beg-stock-select');
    select.addEventListener('change', (e) => showExplanation(e.target.value));
    
    // Initial
    showExplanation(select.value);
}

function showExplanation(symbol) {
    const stock = stocks.find(s => s.symbol === symbol);
    const container = document.getElementById('beginner-content');
    
    // Generate conversational text
    let valuationText = "";
    if (stock.roe > 20) {
        valuationText = `This company is a **Money Making Machine**! For every dollar shareholders invest, they generate ${stock.roe} cents in profit. That's an A+ score.`;
    } else {
        valuationText = `This company is doing okay, but it's not growing its money as fast as the top tech giants. It's like a steady savings account rather than a lottery ticket.`;
    }

    let volatilityText = "";
    if (stock.volatility > 0.03) {
        volatilityText = "⚠️ **Buckle Up!** This stock price moves around A LOT. It's like a rollercoaster - fun if you like thrills, scary if you want safety.";
    } else {
        volatilityText = "🧘 **Calm Waters.** This stock price is pretty stable. It doesn't jump up or down too wildly.";
    }

    // Mock 52 Week High/Low positions
    // We'll simulate it based on current price relative to a random range
    const rangeLow = stock.price * 0.7;
    const rangeHigh = stock.price * 1.3;
    const rangePercent = ((stock.price - rangeLow) / (rangeHigh - rangeLow)) * 100;

    container.innerHTML = `
        <div class="glass-panel beginner-card">
            <h3>🗣️ What is ${stock.symbol} doing?</h3>
            <div class="explanation-bubble">
                <p>${valuationText}</p>
                <br>
                <p>${volatilityText}</p>
            </div>
        </div>

        <div class="glass-panel beginner-card">
            <h3>📏 Price Position (52-Week Range)</h3>
            <p style="color:#aaa; font-size:0.9rem; margin-bottom:10px;">Is it cheap or expensive right now compared to the last year?</p>
            
            <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
                <span>Low: $${rangeLow.toFixed(0)}</span>
                <span>High: $${rangeHigh.toFixed(0)}</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${rangePercent}%"></div>
                <div class="progress-marker" style="left: ${rangePercent}%"></div>
            </div>
            <div style="text-align:center; margin-top:5px; font-weight:bold;">Current: $${stock.price}</div>
        </div>

        <div class="glass-panel beginner-card">
            <h3>📚 Today's Term: "PER"</h3>
            <p><strong>Price-to-Earnings Ratio.</strong> Think of it as "How many years of current profits does it take to pay back the stock price?"</p>
            <ul style="margin-left:20px; margin-top:10px; color:#ccc;">
                <li>High PER (>30): People expect huge growth in the future.</li>
                <li>Low PER (<15): The stock might be cheap, or the company is struggling.</li>
            </ul>
        </div>
    `;
}
