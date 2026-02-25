import { stocks, appSettings } from './store.js';
import { formatCurrency } from './utils.js';

// Internal state
let currentQuizStep = 0;
let quizScore = 0;
let currentTab = 'market'; // Default to new market overview

export function renderBeginner(container) {
    const isKo = appSettings.lang === 'ko';
    
    container.innerHTML = `
        <div class="beginner-container">
            <!-- Header & Tabs -->
            <div class="glass-panel" style="margin-bottom: 20px; padding: 15px;">
                <h2 style="margin-bottom: 15px; text-align: center;">
                    ${isKo ? '🌱 주식 초보자 가이드' : '🌱 Beginner Investor Guide'}
                </h2>
                <div class="beginner-tabs">
                    <button class="tab-btn ${currentTab === 'market' ? 'active' : ''}" data-tab="market">
                        <i class="fa-solid fa-gauge-high"></i> ${isKo ? '시장 온도계' : 'Market Temp'}
                    </button>
                    <button class="tab-btn ${currentTab === 'analysis' ? 'active' : ''}" data-tab="analysis">
                        <i class="fa-solid fa-magnifying-glass-chart"></i> ${isKo ? '쉬운 종목 분석' : 'Easy Analysis'}
                    </button>
                    <button class="tab-btn ${currentTab === 'quiz' ? 'active' : ''}" data-tab="quiz">
                        <i class="fa-solid fa-clipboard-question"></i> ${isKo ? '투자 성향 테스트' : 'Investor Quiz'}
                    </button>
                    <button class="tab-btn ${currentTab === 'learn' ? 'active' : ''}" data-tab="learn">
                        <i class="fa-solid fa-graduation-cap"></i> ${isKo ? '주식 기초 교실' : 'Learning Hub'}
                    </button>
                </div>
            </div>

            <!-- Dynamic Content Area -->
            <div id="beginner-tab-content"></div>
        </div>
    `;

    // Tab Switching Logic
    const buttons = container.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            buttons.forEach(b => b.classList.remove('active'));
            const target = e.currentTarget; 
            target.classList.add('active');
            currentTab = target.dataset.tab;
            renderTabContent(document.getElementById('beginner-tab-content'));
        });
    });

    renderTabContent(document.getElementById('beginner-tab-content'));
}

function renderTabContent(container) {
    container.innerHTML = '';
    switch(currentTab) {
        case 'market': renderMarketOverview(container); break;
        case 'analysis': renderAnalysis(container); break;
        case 'quiz': renderQuiz(container); break;
        case 'learn': renderLearn(container); break;
    }
}

// ==========================================
// 1. MARKET OVERVIEW (NEW)
// ==========================================
function renderMarketOverview(container) {
    const isKo = appSettings.lang === 'ko';
    
    // Calculate Market Temperature
    const avgChange = stocks.reduce((acc, s) => acc + s.change, 0) / stocks.length;
    let tempStatus = "";
    let tempColor = "";
    let tempIcon = "";
    let commentary = "";

    if (avgChange > 1.5) {
        tempStatus = isKo ? "매우 뜨거움 (불장)" : "Very Hot (Bullish)";
        tempColor = "#ef4444";
        tempIcon = "🔥";
        commentary = isKo 
            ? "시장이 전반적으로 큰 상승세를 보이고 있어요. 분위기에 휩쓸려 무리하게 추격 매수하기보다, 차분하게 수익을 챙길 때인지 고민해보세요!"
            : "The market is rallying strongly! Instead of chasing the hype, consider if it's time to realize some profits.";
    } else if (avgChange > 0.2) {
        tempStatus = isKo ? "따뜻함 (완만한 상승)" : "Warm (Slight Up)";
        tempColor = "#f59e0b";
        tempIcon = "☀️";
        commentary = isKo
            ? "시장이 기분 좋게 오르고 있네요. 우량주들이 분위기를 주도하고 있으니, 내가 가진 종목들이 잘 따라가고 있는지 확인해보세요."
            : "The market is moving up nicely. Blue-chip stocks are likely leading the way. Check if your holdings are following the trend.";
    } else if (avgChange > -0.5) {
        tempStatus = isKo ? "적당함 (보합세)" : "Neutral (Sideways)";
        tempColor = "#3b82f6";
        tempIcon = "⚖️";
        commentary = isKo
            ? "시장이 눈치싸움 중이에요. 큰 변화가 없으니 서두르지 말고, 관심 있는 기업의 소식을 더 깊게 파보는 시간을 가져보세요."
            : "The market is waiting for a signal. No big moves today, so it's a good time to research companies you're interested in.";
    } else {
        tempStatus = isKo ? "차가움 (하락장)" : "Cold (Bearish)";
        tempColor = "#10b981";
        tempIcon = "❄️";
        commentary = isKo
            ? "시장에 찬바람이 불고 있어요. 주가가 떨어져서 속상하시겠지만, 좋은 기업을 싸게 살 수 있는 기회가 오고 있는 것일지도 모릅니다!"
            : "The market is cooling down. Prices are dropping, but this could be an opportunity to buy great companies at a discount.";
    }

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; animation: fadeIn 0.4s ease;">
            <!-- Temperature Card -->
            <div class="glass-panel" style="padding: 30px; text-align: center;">
                <h3 style="margin-bottom: 20px;">${isKo ? '📊 현재 시장 온도' : '📊 Market Temperature'}</h3>
                <div style="font-size: 4rem; margin-bottom: 10px;">${tempIcon}</div>
                <div style="font-size: 1.8rem; font-weight: bold; color: ${tempColor}; margin-bottom: 10px;">${tempStatus}</div>
                <p style="font-size: 1.1rem; line-height: 1.6; color: var(--text-primary);">${commentary}</p>
            </div>

            <!-- Quick Action Checklist -->
            <div class="glass-panel" style="padding: 30px;">
                <h3 style="margin-bottom: 20px;"><i class="fa-solid fa-list-check"></i> ${isKo ? '오늘의 체크리스트' : 'Today\'s Checklist'}</h3>
                <div style="display: grid; gap: 15px;">
                    <div class="explanation-bubble" style="margin:0; background: rgba(59, 130, 246, 0.1);">
                        <strong>1. ${isKo ? '환율 확인하기' : 'Check Exchange Rate'}</strong><br>
                        ${isKo ? '미국 주식은 환율 영향이 커요. 달러가 비싼지 확인해보세요.' : 'Currency flux affects US stocks. Check if USD is strong today.'}
                    </div>
                    <div class="explanation-bubble" style="margin:0; background: rgba(16, 185, 129, 0.1);">
                        <strong>2. ${isKo ? '공포/탐욕 지수' : 'Fear & Greed Index'}</strong><br>
                        ${isKo ? '남들이 너무 흥분해있을 땐 조심해야 합니다.' : 'Be careful when everyone else is greedy.'}
                    </div>
                    <div class="explanation-bubble" style="margin:0; background: rgba(245, 158, 11, 0.1);">
                        <strong>3. ${isKo ? '내 자산 비중' : 'Portfolio Balance'}</strong><br>
                        ${isKo ? '한 종목에 너무 많이 몰려있지는 않나요?' : 'Are you too concentrated in one stock?'}
                    </div>
                </div>
            </div>

            <!-- Top Sector Info -->
            <div class="glass-panel" style="padding: 30px; grid-column: 1 / -1;">
                <h3 style="margin-bottom: 20px;"><i class="fa-solid fa-magnifying-glass"></i> ${isKo ? '간단 요약' : 'Quick Summary'}</h3>
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 250px;">
                        <p style="color: var(--text-secondary); margin-bottom: 10px;">${isKo ? '가장 활발한 종목' : 'Most Active Stock'}</p>
                        <div style="font-size: 1.5rem; font-weight: bold;">
                            ${stocks[0].name} (${stocks[0].symbol}) 
                            <span class="text-green" style="font-size: 1rem;">${stocks[0].change > 0 ? '+' : ''}${stocks[0].change}%</span>
                        </div>
                    </div>
                    <div style="flex: 1; min-width: 250px;">
                        <p style="color: var(--text-secondary); margin-bottom: 10px;">${isKo ? '시장 주도 섹터' : 'Leading Sector'}</p>
                        <div style="font-size: 1.5rem; font-weight: bold;">Technology (기술주) 💻</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// 2. ANALYSIS TAB
// ==========================================
function renderAnalysis(container) {
    const isKo = appSettings.lang === 'ko';
    container.innerHTML = `
        <div class="glass-panel" style="padding: 20px; margin-bottom: 20px; animation: fadeIn 0.3s ease;">
            <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h3 style="margin-bottom: 5px;">${isKo ? '돋보기 종목 분석' : 'Deep Dive Analysis'}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">${isKo ? '복잡한 숫자 대신 이해하기 쉬운 설명으로 알려드려요.' : 'Simple explanations instead of complex numbers.'}</p>
                </div>
                <select id="beg-stock-select" class="styled-select" style="max-width: 250px;">
                    ${stocks.filter(s => !s.type).map(s => `<option value="${s.symbol}">${s.name} (${s.symbol})</option>`).join('')}
                </select>
            </div>
            <div id="analysis-hero" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;"></div>
        </div>
    `;
    const select = document.getElementById('beg-stock-select');
    select.addEventListener('change', (e) => updateAnalysisHero(e.target.value));
    if (stocks.length > 0) updateAnalysisHero(stocks[0].symbol);
}

function updateAnalysisHero(symbol) {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;
    const container = document.getElementById('analysis-hero');
    const isKo = appSettings.lang === 'ko';
    const getHealthStatus = (s) => {
        if (s.peRatio < 15 && s.roe > 15) return isKo ? { text: "저평가 꿀맛", color: "#10b981", icon: "🍯" } : { text: "Value Pick", color: "#10b981", icon: "🍯" };
        if (s.peRatio > 50) return isKo ? { text: "기대감 뿜뿜", color: "#f59e0b", icon: "🚀" } : { text: "High Growth", color: "#f59e0b", icon: "🚀" };
        return isKo ? { text: "적당한 상태", color: "#3b82f6", icon: "⚖️" } : { text: "Stable State", color: "#3b82f6", icon: "⚖️" };
    };
    const health = getHealthStatus(stock);
    container.innerHTML = `
        <div class="glass-panel" style="padding: 25px; border-left: 6px solid ${health.color}; background: rgba(255,255,255,0.02);">
            <div style="font-size: 3rem; margin-bottom: 10px;">${health.icon}</div>
            <h2 style="margin-bottom: 10px; color: ${health.color};">${health.text}</h2>
            <p style="font-size: 1.1rem; line-height: 1.7; margin-bottom: 20px;">
                <strong>${stock.name}</strong>${isKo ? '은(는) 현재 ' : ' is currently '}
                ${health.text.includes("꿀맛") || health.text.includes("Value") ? (isKo ? "돈 버는 능력에 비해 가격이 참 착해요!" : "priced very well for its earnings!") : health.text.includes("뿜뿜") || health.text.includes("Growth") ? (isKo ? "미래 성장이 기대되지만 가격은 좀 비싼 편이에요." : "promising for growth but priced at a premium.") : (isKo ? "안정적이고 적당한 가격대에 머물러 있습니다." : "performing steadily at a fair price.")}
            </p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <span class="chip" style="background:${health.color}22; color:${health.color}; border: 1px solid ${health.color}44;">${stock.sector}</span>
                <span class="chip">${isKo ? '시총' : 'MCap'}: ${formatCurrency(stock.marketCap)}</span>
            </div>
        </div>
        <div class="glass-panel" style="padding: 25px; background: rgba(255,255,255,0.02);">
            <h3 style="margin-bottom: 20px;"><i class="fa-solid fa-heart-pulse"></i> ${isKo ? '기업 건강 진단' : 'Business Vital Signs'}</h3>
            <div style="display: grid; gap: 20px;">
                <div class="vital-row">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 8px;"><span>${isKo ? '수익 능력 (ROE)' : 'Profitability'}</span><strong>${stock.roe}%</strong></div>
                    <div class="bar-container" style="height: 10px;"><div class="bar-fill" style="width: ${Math.min(stock.roe * 2, 100)}%; background: #10b981;"></div></div>
                </div>
                <div class="vital-row">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 8px;"><span>${isKo ? '빚의 무게' : 'Debt Level'}</span><strong>${stock.debtRatio}%</strong></div>
                    <div class="bar-container" style="height: 10px;"><div class="bar-fill" style="width: ${Math.min(stock.debtRatio / 2, 100)}%; background: ${stock.debtRatio > 100 ? '#ef4444' : '#3b82f6'};"></div></div>
                </div>
            </div>
            <div style="margin-top: 25px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; font-size: 0.9rem;">
                <strong>${isKo ? '전문가 한마디' : 'Expert Tip'}:</strong> ${stock.roe > 15 && stock.debtRatio < 100 ? (isKo ? "아주 튼튼한 기업입니다. 믿음직하네요! 👍" : "A very solid company. Looks reliable! 👍") : (isKo ? "조금 더 지켜보며 신중히 결정하세요. 🧐" : "Keep a close watch and decide carefully. 🧐")}
            </div>
        </div>
    `;
}

// ==========================================
// 3. QUIZ TAB
// ==========================================
function renderQuiz(container) {
    const isKo = appSettings.lang === 'ko';
    const questions = [
        {
            q: isKo ? "주식 투자의 가장 큰 목적은?" : "What is your main goal?",
            a: [
                { text: isKo ? "손해 보더라도 대박 수익!" : "Big Gains (Even if risky)", score: 3 },
                { text: isKo ? "은행 이자보다 조금만 더." : "Better than a Bank", score: 1 },
                { text: isKo ? "적당한 수익과 안정성." : "Balance of Growth & Safety", score: 2 }
            ]
        },
        {
            q: isKo ? "주가가 20% 떨어졌다면?" : "The market drops 20%. You...",
            a: [
                { text: isKo ? "무서워서 다 판다." : "Panic sell everything!", score: 1 },
                { text: isKo ? "오히려 싸게 살 기회다!" : "Buy more! It's a sale.", score: 3 },
                { text: isKo ? "지켜본다." : "Wait and see.", score: 2 }
            ]
        }
    ];

    if (currentQuizStep < questions.length) {
        const q = questions[currentQuizStep];
        container.innerHTML = `
            <div class="glass-panel" style="max-width:600px; margin:0 auto; text-align:center; padding: 30px;">
                <h3>Q${currentQuizStep + 1}. ${q.q}</h3>
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
                    ${q.a.map(opt => `<button class="quiz-btn" data-score="${opt.score}">${opt.text}</button>`).join('')}
                </div>
            </div>
        `;
        container.querySelectorAll('.quiz-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                quizScore += parseInt(btn.dataset.score);
                currentQuizStep++;
                renderQuiz(container);
            });
        });
    } else {
        const type = quizScore <= 3 ? (isKo ? "🛡️ 안전 제일 거북이" : "🛡️ The Safe Turtle") : (isKo ? "🚀 공격적인 사자" : "🚀 The Bold Lion");
        container.innerHTML = `<div class="glass-panel" style="text-align:center; padding: 40px;"><h2>${type}</h2><button id="reset-quiz" class="action-btn" style="margin-top:20px;">${isKo ? '다시 하기' : 'Restart'}</button></div>`;
        document.getElementById('reset-quiz').addEventListener('click', () => { currentQuizStep = 0; quizScore = 0; renderQuiz(container); });
    }
}

// ==========================================
// 4. LEARN TAB
// ==========================================
function renderLearn(container) {
    const isKo = appSettings.lang === 'ko';
    const topics = [
        { title: isKo ? "주식이란?" : "Stock?", content: isKo ? "기업의 주인이 되는 권리입니다." : "Ownership in a company." },
        { title: isKo ? "배당금이란?" : "Dividend?", content: isKo ? "기업이 번 돈을 나눠주는 보너스입니다." : "Profit sharing with shareholders." },
        { title: isKo ? "시가총액이란?" : "Market Cap?", content: isKo ? "기업의 전체 몸값입니다." : "Total value of the company." }
    ];
    container.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
            ${topics.map(t => `<div class="glass-panel" style="padding:20px;"><h4 style="color:var(--accent-blue); margin-bottom:10px;">${t.title}</h4><p>${t.content}</p></div>`).join('')}
        </div>
    `;
}
