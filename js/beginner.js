import { stocks, appSettings } from './store.js';
import { formatCurrency } from './utils.js';

// Internal state for the quiz
let currentQuizStep = 0;
let quizScore = 0;
let currentTab = 'analysis'; // analysis, quiz, learn

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
                    <button class="tab-btn active" data-tab="analysis">
                        <i class="fa-solid fa-magnifying-glass-chart"></i> ${isKo ? '쉬운 종목 분석' : 'Easy Analysis'}
                    </button>
                    <button class="tab-btn" data-tab="quiz">
                        <i class="fa-solid fa-clipboard-question"></i> ${isKo ? '투자 성향 테스트' : 'Investor Quiz'}
                    </button>
                    <button class="tab-btn" data-tab="learn">
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
            // Update UI
            buttons.forEach(b => b.classList.remove('active'));
            const target = e.currentTarget; 
            target.classList.add('active');
            
            // Update State & Render
            currentTab = target.dataset.tab;
            renderTabContent(document.getElementById('beginner-tab-content'));
        });
    });

    // Initial Render
    renderTabContent(document.getElementById('beginner-tab-content'));
}

function renderTabContent(container) {
    container.innerHTML = '';
    
    switch(currentTab) {
        case 'analysis':
            renderAnalysis(container);
            break;
        case 'quiz':
            renderQuiz(container);
            break;
        case 'learn':
            renderLearn(container);
            break;
    }
}

// ==========================================
// 1. ANALYSIS TAB
// ==========================================
function renderAnalysis(container) {
    const isKo = appSettings.lang === 'ko';
    
    container.innerHTML = `
        <div class="glass-panel beginner-card" style="animation: fadeIn 0.3s ease;">
            <label style="display:block; margin-bottom:10px;">
                ${isKo ? '분석할 종목을 선택하세요:' : 'Choose a Stock to Analyze:'}
            </label>
            <select id="beg-stock-select" class="styled-select">
                ${stocks.filter(s => !s.type).map(s => `<option value="${s.symbol}">${s.name} (${s.symbol})</option>`).join('')}
            </select>
        </div>
        <div id="analysis-results" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;"></div>
    `;

    const select = document.getElementById('beg-stock-select');
    select.addEventListener('change', (e) => showExplanation(e.target.value));

    if (stocks.length > 0) {
        showExplanation(stocks[0].symbol);
    }
}

function showExplanation(symbol) {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;

    const container = document.getElementById('analysis-results');
    const isKo = appSettings.lang === 'ko';

    // -- Enhanced Logic Helper for Diversity --
    const getValuationText = (stock) => {
        const pe = stock.peRatio;
        const vol = stock.volatility;
        const change = stock.change;

        if (pe > 50) {
            if (vol > 0.04) return isKo 
                ? { title: "초고속 성장 기대주", text: "변동성이 크고 기대감이 엄청나요! 하이 리스크 하이 리턴의 정석입니다.", icon: "🚀", color: "#d946ef" }
                : { title: "Hyper Growth", text: "Massive expectations and high volatility! A classic high-risk, high-reward play.", icon: "🚀", color: "#d946ef" };
            return isKo 
                ? { title: "높은 프리미엄", text: "시장이 이 주식의 미래에 비싼 값을 매겼어요. 성장이 계속되어야 주가가 유지됩니다.", icon: "🔥", color: "#FF6B6B" }
                : { title: "High Hopes", text: "Investors are paying a premium for future growth. It needs to keep winning!", icon: "🔥", color: "#FF6B6B" };
        }
        
        if (pe < 12) {
            if (change < -5) return isKo
                ? { title: "위기인가 기회인가", text: "최근 주가가 많이 빠졌고 가격도 저렴해요. 반등을 기다리는 전략이 필요할지도?", icon: "⚠️", color: "#f59e0b" }
                : { title: "Crisis or Chance?", text: "Price dropped recently and valuation is low. Is a rebound coming?", icon: "⚠️", color: "#f59e0b" };
            return isKo
                ? { title: "저평가된 보석", text: "이익에 비해 주가가 참 착해요. 안정적인 투자를 원하는 분들께 매력적일 수 있습니다.", icon: "💎", color: "#4ECDC4" }
                : { title: "Hidden Gem", text: "Very cheap relative to earnings. Attractive for value-seeking investors.", icon: "💎", color: "#4ECDC4" };
        }

        if (vol < 0.015) return isKo
            ? { title: "안전한 대피소", text: "주가 움직임이 매우 점잖아요. 큰 수익보다는 자산 보존에 유리합니다.", icon: "🛡️", color: "#3b82f6" }
            : { title: "Safe Haven", text: "Very stable price movement. Good for capital preservation, not quick wins.", icon: "🛡️", color: "#3b82f6" };

        return isKo
            ? { title: "시장 평균 수준", text: "딱 적당한 온도의 주식입니다. 너무 뜨겁지도 차갑지도 않아요.", icon: "⚖️", color: "#FFE66D" }
            : { title: "Market Standard", text: "Priced reasonably. Not too hot, not too cold. Solid baseline pick.", icon: "⚖️", color: "#FFE66D" };
    };

    const valData = getValuationText(stock);

    const margin = stock.profitMargin || 10;
    const marginText = isKo 
        ? (margin > 20 ? "수익성이 괴물 수준이에요! 효율적으로 돈을 법니다." : margin > 10 ? "장사를 제법 잘하고 있어요." : "수익성은 평범한 수준입니다.")
        : (margin > 20 ? "Efficiency monster! High profit margins." : margin > 10 ? "Doing good business." : "Average profitability.");

    const debtRatio = stock.debtRatio || 50;
    const debtText = isKo
        ? (debtRatio < 30 ? "지갑이 아주 튼튼해요(빚이 거의 없음)." : debtRatio < 70 ? "빚 관리를 적절히 하고 있네요." : "빚이 좀 많아서 주의가 필요해요.")
        : (debtRatio < 30 ? "Fortress balance sheet. Almost no debt." : debtRatio < 70 ? "Debt is under control." : "High debt, needs careful watching.");

    container.innerHTML = `
        <!-- 1. AI Insight Card -->
        <div class="glass-panel beginner-card" style="border-left: 5px solid ${valData.color};">
            <h3 style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <span style="font-size:1.5rem;">${valData.icon}</span> 
                ${valData.title}
            </h3>
            <p style="font-size:1.1rem; line-height:1.6;">${valData.text}</p>
            <div style="margin-top:15px; padding:10px; background:rgba(255,255,255,0.05); border-radius:8px;">
                <p><strong>${isKo ? '전문가 소견' : 'Expert View'}:</strong> ${marginText} ${debtText}</p>
            </div>
        </div>

        <!-- 2. Time Machine Calculator -->
        <div class="glass-panel beginner-card">
            <h3>⏳ ${isKo ? '타임머신 계산기' : 'Time Machine'}</h3>
            <p style="margin-bottom:15px; font-size:0.9rem; color:var(--text-secondary);">
                ${isKo ? '1년 전에 100만원을 넣었다면?' : 'If I invested $1,000 1 year ago...'}
            </p>
            
            <div class="calc-box" style="text-align:center; padding:20px; background:rgba(0,0,0,0.2); border-radius:12px;">
                <div style="font-size:2rem; font-weight:bold; color:${stock.change > 0 ? '#4ECDC4' : '#FF6B6B'};">
                    ${stock.change > 0 ? '+' : ''}${(stock.change * 10).toFixed(1)}%
                </div>
                <div style="margin-top:5px;">
                    ${isKo ? '내 돈은 이렇게 변했을 거에요:' : 'My Portfolio Value:'}
                </div>
                <div style="font-size:1.5rem; font-weight:bold; margin-top:5px;">
                    $${(1000 * (1 + stock.change/10)).toFixed(2)}
                </div>
            </div>
            <p style="font-size:0.8rem; margin-top:10px; text-align:center; opacity:0.7;">
                * ${isKo ? '과거 데이터 기반 단순 시뮬레이션입니다.' : 'Based on simulated past performance.'}
            </p>
        </div>

        <!-- 3. Key Stats Visualized -->
        <div class="glass-panel beginner-card">
            <h3>📊 ${isKo ? '핵심 숫자들' : 'The Numbers'}</h3>
            
            <div class="stat-row">
                <span>P/E Ratio</span>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${Math.min(stock.peRatio, 100)}%; background: #a8d5e2;"></div>
                    <span class="bar-text">${stock.peRatio}</span>
                </div>
            </div>
            
            <div class="stat-row">
                <span>Div. Yield</span>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${(stock.dividend || 0) * 10}%; background: #a2d2ff;"></div>
                    <span class="bar-text">${stock.dividend || 0}%</span>
                </div>
            </div>

            <div class="stat-row">
                <span>Volatility</span>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${stock.volatility * 1000}%; background: #ffc8dd;"></div>
                    <span class="bar-text">${stock.volatility}</span>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// 2. QUIZ TAB
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
        },
        {
            q: isKo ? "투자 기간은 얼마나 생각하나요?" : "How long will you invest?",
            a: [
                { text: isKo ? "1년 미만" : "Less than 1 year", score: 3 },
                { text: isKo ? "1년 ~ 5년" : "1-5 Years", score: 2 },
                { text: isKo ? "10년 이상" : "10+ Years", score: 1 }
            ]
        }
    ];

    if (currentQuizStep < questions.length) {
        const q = questions[currentQuizStep];
        container.innerHTML = `
            <div class="glass-panel beginner-card" style="max-width:600px; margin:0 auto; text-align:center;">
                <h3>Q${currentQuizStep + 1}. ${q.q}</h3>
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
                    ${q.a.map((opt, idx) => `
                        <button class="quiz-btn" data-score="${opt.score}">
                            ${opt.text}
                        </button>
                    `).join('')}
                </div>
                <div style="margin-top:20px; color:var(--text-secondary);">
                    Step ${currentQuizStep + 1} / ${questions.length}
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
        let type = "";
        let desc = "";
        
        if (quizScore <= 4) {
            type = isKo ? "🛡️ 안전 제일 '거북이' 투자자" : "🛡️ The Safe Turtle";
            desc = isKo 
                ? "잃지 않는 투자를 중요하게 생각하시는군요! 배당주나 우량주 위주의 투자를 추천합니다." 
                : "You prioritize safety. Stick to blue-chip stocks and dividends!";
        } else if (quizScore <= 7) {
            type = isKo ? "⚖️ 균형 잡힌 '전략가' 투자자" : "⚖️ The Balanced Strategist";
            desc = isKo 
                ? "위험과 수익을 적절히 관리하시네요. 성장주와 가치주를 섞어서 포트폴리오를 짜보세요."
                : "You know when to take risks. Build a mixed portfolio of growth and value.";
        } else {
            type = isKo ? "🚀 인생은 한방 '사자' 투자자" : "🚀 The Risk-Taking Lion";
            desc = isKo
                ? "높은 수익을 위해 위험을 감수하는 스타일! 테마주나 급등주에 관심이 많으시겠어요. 하지만 몰빵은 금물!"
                : "You want big gains! You might like volatile tech stocks, but watch out for crashes.";
        }

        container.innerHTML = `
            <div class="glass-panel beginner-card" style="max-width:600px; margin:0 auto; text-align:center; animation: fadeIn 0.5s;">
                <h1 style="font-size:3rem; margin-bottom:10px;">${type.split(' ')[0]}</h1>
                <h2>${type.substring(2)}</h2>
                <p style="margin:20px 0; font-size:1.1rem; line-height:1.6;">${desc}</p>
                <button id="reset-quiz" style="padding:10px 20px; border-radius:8px; border:none; background:var(--accent-blue); color:white; cursor:pointer;">
                    ${isKo ? '다시 하기' : 'Retake Quiz'}
                </button>
            </div>
        `;

        document.getElementById('reset-quiz').addEventListener('click', () => {
            currentQuizStep = 0;
            quizScore = 0;
            renderQuiz(container);
        });
    }
}

// ==========================================
// 3. LEARN TAB
// ==========================================
function renderLearn(container) {
    const isKo = appSettings.lang === 'ko';
    
    const topics = [
        {
            title: isKo ? "주식이란 무엇인가요?" : "What is a Stock?",
            content: isKo 
                ? "회사의 주인인 '주주'가 될 수 있는 증서입니다. 회사가 돈을 벌면 나눠가질 권리가 생겨요." 
                : "It represents ownership in a company. Buying a stock means you own a tiny slice of that business."
        },
        {
            title: isKo ? "배당금이 뭐예요?" : "What is a Dividend?",
            content: isKo
                ? "회사가 번 돈의 일부를 주주들에게 보너스처럼 나눠주는 현금입니다."
                : "A portion of the company's profits paid out directly to shareholders, usually every quarter."
        },
        {
            title: isKo ? "PER가 뭔가요?" : "What is P/E Ratio?",
            content: isKo
                ? "주가가 버는 돈의 몇 배인지를 나타내는 지표입니다. 낮으면 저평가, 높으면 고평가일 가능성이 높아요."
                : "Price-to-Earnings Ratio. It measures how expensive a stock is relative to how much money the company makes."
        },
        {
            title: isKo ? "물타기가 뭔가요?" : "What is DCA?",
            content: isKo
                ? "주가가 떨어질 때마다 추가로 매수해서 평균 단가를 낮추는 전략입니다. (Dollar Cost Averaging)"
                : "Dollar Cost Averaging. Buying a fixed dollar amount of a stock regularly, regardless of the price."
        }
    ];

    container.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
            ${topics.map(topic => `
                <div class="glass-panel beginner-card learn-card">
                    <h3 style="margin-bottom:10px; color:var(--accent-blue);"><i class="fa-solid fa-book-open"></i> ${topic.title}</h3>
                    <p style="line-height:1.6; color:var(--text-secondary);">${topic.content}</p>
                </div>
            `).join('')}
        </div>
    `;
}
