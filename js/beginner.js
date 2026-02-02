import { stocks, appSettings } from './store.js';
import { formatCurrency } from './utils.js';

export function renderBeginner(container) {
    const isKo = appSettings.lang === 'ko';
    
    container.innerHTML = `
        <div class="glass-panel beginner-card">
            <h2 style="margin-bottom:20px;">${isKo ? '🔰 주식 초보 탈출기' : '🔰 Easy Mode Stock Analysis'}</h2>
            <label>${isKo ? '분석할 종목을 선택하세요:' : 'Choose a Stock to Learn About:'}</label>
            <select id="beg-stock-select" style="background:rgba(0,0,0,0.3); color:var(--text-primary); padding:12px; border-radius:8px; width:100%; margin-top:10px; font-size:1.1rem; border:1px solid var(--glass-border);">
                ${stocks.filter(s => !s.type).map(s => `<option value="${s.symbol}">${s.name} (${s.symbol})</option>`).join('')}
            </select>
        </div>
        <div id="beginner-content"></div>
    `;

    const select = document.getElementById('beg-stock-select');
    select.addEventListener('change', (e) => showExplanation(e.target.value));
    
    // Initial load
    if (stocks.length > 0) {
        showExplanation(stocks[0].symbol); // Default to first stock
    } else {
        document.getElementById('beginner-content').innerHTML = '<div style="padding:20px; text-align:center;">No stocks loaded yet.</div>';
    }
}

function showExplanation(symbol) {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;

    const container = document.getElementById('beginner-content');
    const isKo = appSettings.lang === 'ko';
    
    // Logic for conversational text
    let valuationText = "";
    if (stock.peRatio > 40) {
        valuationText = isKo 
            ? `이 회사는 **미래 성장 기대감**이 아주 높아요! 현재 버는 돈에 비해 주가가 비싼 편이지만, 사람들이 "나중에 대박 날 거야"라고 믿고 있다는 뜻이죠.`
            : `Investors have **high expectations** for this company! The stock is expensive compared to current earnings, but people believe it will grow massively.`;
    } else if (stock.peRatio < 15) {
        valuationText = isKo
            ? `현재 주가가 버는 돈에 비해 **저렴한 편**이에요. 알짜배기 가치주이거나, 시장에서 소외받고 있을 수도 있어요.`
            : `This stock looks **cheap** relative to its earnings. It might be a hidden gem (Value Stock) or currently ignored by the market.`;
    } else {
        valuationText = isKo
            ? `주가가 적정한 수준으로 평가받고 있어요. 너무 비싸지도, 너무 싸지도 않은 **표준적인 상태**입니다.`
            : `The price is fairly valued. It's neither too expensive nor a bargain—just a **standard** valuation.`;
    }

    let volatilityText = "";
    if (stock.volatility > 0.03) {
        volatilityText = isKo
            ? `⚠️ **롤러코스터 주의!** 주가가 하루에도 위아래로 크게 움직여요. 심장이 약하다면 조심해야 합니다.`
            : `⚠️ **Buckle Up!** This stock price moves around A LOT. It's like a rollercoaster—fun if you like thrills, scary if you want safety.`;
    } else {
        volatilityText = isKo
            ? `🧘 **잔잔한 호수 같아요.** 주가 변동이 크지 않아서 마음 편하게 투자할 수 있는 종목입니다.`
            : `🧘 **Calm Waters.** This stock price is pretty stable. It doesn't jump up or down too wildly.`;
    }

    // Mock 52 Week High/Low (if live data missing, simulate)
    const rangeLow = stock.low || stock.price * 0.7;
    const rangeHigh = stock.high || stock.price * 1.3;
    const rangePercent = Math.min(100, Math.max(0, ((stock.price - rangeLow) / (rangeHigh - rangeLow)) * 100));

    container.innerHTML = `
        <!-- AI Explanation Card -->
        <div class="glass-panel beginner-card">
            <h3 style="margin-bottom:10px;">🗣️ ${isKo ? 'AI 해설' : 'AI Explanation'} for ${stock.symbol}</h3>
            <p style="color:var(--text-secondary); margin-bottom:15px; font-style:italic;">"${stock.description || (isKo ? '정보 없음' : 'No description available')}"</p>
            <div class="explanation-bubble">
                <p>${valuationText}</p>
                <br>
                <p>${volatilityText}</p>
            </div>
        </div>

        <!-- Price Position Card -->
        <div class="glass-panel beginner-card">
            <h3>📏 ${isKo ? '현재 가격 위치 (52주)' : 'Price Position (52-Week Range)'}</h3>
            <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:10px;">
                ${isKo ? '지난 1년 중 지금이 싼 편일까요, 비싼 편일까요?' : 'Is it cheap or expensive right now compared to the last year?'}
            </p>
            
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

        <!-- Stats Card -->
        <div class="glass-panel beginner-card">
            <h3>📚 ${isKo ? '핵심 용어 정리' : 'Key Stats Simplified'}</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-top:10px;">
                <div style="background:rgba(125,125,125,0.1); padding:10px; border-radius:8px;">
                    <div style="color:var(--text-secondary); font-size:0.8rem;">${isKo ? '시가총액 (몸집)' : 'Market Cap (Size)'}</div>
                    <div style="font-weight:bold; font-size:1.1rem;">${formatCurrency(stock.marketCap)}</div>
                    <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">
                        ${isKo ? '이 회사를 통째로 사려면 필요한 돈이에요.' : 'How much the whole company is worth.'}
                    </div>
                </div>
                <div style="background:rgba(125,125,125,0.1); padding:10px; border-radius:8px;">
                    <div style="color:var(--text-secondary); font-size:0.8rem;">${isKo ? '배당 수익률 (보너스)' : 'Dividend Yield'}</div>
                    <div style="font-weight:bold; font-size:1.1rem;">${stock.dividend || 0}%</div>
                    <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">
                        ${isKo ? '주식을 갖고 있으면 1년에 주는 이자 같은 돈이에요.' : 'Annual cash bonus paid to you.'}
                    </div>
                </div>
            </div>
        </div>
    `;
}
