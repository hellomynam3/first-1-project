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
// 1. ANALYSIS TAB (Overhauled)
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
            
            <div id="analysis-hero" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <!-- Content Injected Here -->
            </div>
        </div>
    `;

    const select = document.getElementById('beg-stock-select');
    select.addEventListener('change', (e) => updateAnalysisHero(e.target.value));

    if (stocks.length > 0) {
        updateAnalysisHero(stocks[0].symbol);
    }
}

function updateAnalysisHero(symbol) {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;

    const container = document.getElementById('analysis-hero');
    const isKo = appSettings.lang === 'ko';

    // Helper logic for simplified status
    const getHealthStatus = (stock) => {
        if (stock.peRatio < 15 && stock.roe > 15) return isKo ? { text: "저평가 꿀맛", color: "#10b981", icon: "🍯" } : { text: "Value Pick", color: "#10b981", icon: "🍯" };
        if (stock.peRatio > 50) return isKo ? { text: "기대감 뿜뿜", color: "#f59e0b", icon: "🚀" } : { text: "High Growth", color: "#f59e0b", icon: "🚀" };
        return isKo ? { text: "적당한 상태", color: "#3b82f6", icon: "⚖️" } : { text: "Stable State", color: "#3b82f6", icon: "⚖️" };
    };

    const health = getHealthStatus(stock);

    container.innerHTML = `
        <!-- Left: Summary Card -->
        <div class="glass-panel" style="padding: 25px; border-left: 6px solid ${health.color}; background: rgba(255,255,255,0.02);">
            <div style="font-size: 3rem; margin-bottom: 10px;">${health.icon}</div>
            <h2 style="margin-bottom: 10px; color: ${health.color};">${health.text}</h2>
            <p style="font-size: 1.1rem; line-height: 1.7; margin-bottom: 20px;">
                <strong>${stock.name}</strong>${isKo ? '은(는) 현재 ' : ' is currently '}
                ${health.text === (isKo ? "저평가 꿀맛" : "Value Pick") 
                    ? (isKo ? "벌어들이는 돈에 비해 가격이 매우 착한 편이에요. 알짜배기 기업일 가능성이 높습니다!" : " priced very cheaply compared to its earnings. It's likely a solid value company!") 
                    : health.text === (isKo ? "기대감 뿜뿜" : "High Growth")
                    ? (isKo ? "미래 성장에 대한 기대가 엄청나서 가격이 좀 비싸게 형성되어 있어요. 변동성을 조심하세요!" : " priced with massive expectations for future growth. Watch out for volatility!")
                    : (isKo ? "시장에서 적정한 대우를 받고 있는 우량한 상태입니다. 안정적인 흐름이 예상돼요." : " performing steadily and is fairly valued by the market. Expect stable movement.")}
            </p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <span class="chip" style="background:${health.color}22; color:${health.color}; border: 1px solid ${health.color}44;">${stock.sector}</span>
                <span class="chip">${isKo ? '시총' : 'MCap'}: ${formatCurrency(stock.marketCap)}</span>
            </div>
        </div>

        <!-- Right: Vital Signs -->
        <div class="glass-panel" style="padding: 25px; background: rgba(255,255,255,0.02);">
            <h3 style="margin-bottom: 20px;"><i class="fa-solid fa-heart-pulse"></i> ${isKo ? '기업 건강 진단' : 'Business Vital Signs'}</h3>
            
            <div style="display: grid; gap: 20px;">
                <div class="vital-row">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                        <span><i class="fa-solid fa-hand-holding-dollar"></i> ${isKo ? '수익 능력 (ROE)' : 'Profitability (ROE)'}</span>
                        <strong class="${stock.roe > 20 ? 'text-green' : ''}">${stock.roe}%</strong>
                    </div>
                    <div class="bar-container" style="height: 10px;">
                        <div class="bar-fill" style="width: ${Math.min(stock.roe * 2, 100)}%; background: #10b981;"></div>
                    </div>
                </div>

                <div class="vital-row">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                        <span><i class="fa-solid fa-scale-balanced"></i> ${isKo ? '빚의 무게 (부채비율)' : 'Debt Level'}</span>
                        <strong class="${stock.debtRatio > 100 ? 'text-red' : ''}">${stock.debtRatio}%</strong>
                    </div>
                    <div class="bar-container" style="height: 10px;">
                        <div class="bar-fill" style="width: ${Math.min(stock.debtRatio / 2, 100)}%; background: ${stock.debtRatio > 100 ? '#ef4444' : '#3b82f6'};"></div>
                    </div>
                </div>

                <div class="vital-row">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                        <span><i class="fa-solid fa-coins"></i> ${isKo ? '배당 매력' : 'Dividend Appeal'}</span>
                        <strong>${stock.dividend > 0 ? stock.dividend + '%' : (isKo ? '없음' : 'None')}</strong>
                    </div>
                    <div class="bar-container" style="height: 10px;">
                        <div class="bar-fill" style="width: ${Math.min(stock.dividend * 20, 100)}%; background: #f59e0b;"></div>
                    </div>
                </div>
            </div>

            <div style="margin-top: 25px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; font-size: 0.95rem;">
                <strong>${isKo ? '초보 팁' : 'Tip'}:</strong> ${stock.roe > 15 && stock.debtRatio < 100 ? (isKo ? "이 기업은 돈도 잘 벌고 빚 관리도 아주 잘하고 있어요! 👍" : "This company is profitable and manages debt well! 👍") : (isKo ? "숫자들을 잘 살펴보며 신중하게 접근해보세요. 🧐" : "Look at the numbers carefully before investing. 🧐")}
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
        },
        {
            title: isKo ? "ETF가 뭔가요?" : "What is an ETF?",
            content: isKo
                ? "여러 주식을 한 바구니에 담아 파는 상품입니다. 하나만 사도 분산 투자 효과를 볼 수 있어요."
                : "Exchange Traded Fund. A basket of many stocks you can buy at once. Great for diversification!"
        },
        {
            title: isKo ? "시가총액이 뭐예요?" : "What is Market Cap?",
            content: isKo
                ? "회사의 총 가치를 돈으로 환산한 것입니다. (주식 수 × 현재 주가)"
                : "Total value of a company. (Number of shares × Stock price). Bigger means more established."
        },
        {
            title: isKo ? "복리의 마법" : "Compound Interest",
            content: isKo
                ? "수익이 또 수익을 낳는 원리입니다. 시간이 지날수록 눈덩이처럼 불어나요. 일찍 시작하는 게 최고!"
                : "Earning interest on your interest. It snowballs over time. The earlier you start, the better!"
        },
        {
            title: isKo ? "매수와 매도" : "Buy and Sell",
            content: isKo
                ? "매수는 주식을 사는 것, 매도는 주식을 파는 것입니다. 빨간색은 상승, 파란색은 하락을 의미해요."
                : "Buy means getting shares, Sell means giving them away. Green is Up, Red is Down."
        }
    ];

    const rules = [
        {
            title: isKo ? "분산 투자" : "Diversification",
            text: isKo ? "한 바구니에 모든 달걀을 담지 마세요." : "Don't put all your eggs in one basket."
        },
        {
            title: isKo ? "장기 투자" : "Long-term Investing",
            text: isKo ? "단기적인 출렁임에 흔들리지 마세요." : "Don't let short-term noise shake you out."
        },
        {
            title: isKo ? "여유 자금" : "Emergency Fund",
            text: isKo ? "당장 써야 할 돈으로 투자하지 마세요." : "Never invest money you need next month."
        }
    ];

    container.innerHTML = `
        <div style="margin-bottom: 30px;">
            <h3 style="margin-bottom: 15px;"><i class="fa-solid fa-graduation-cap"></i> ${isKo ? '필수 용어 사전' : 'Core Glossary'}</h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
                ${topics.map(topic => `
                    <div class="glass-panel beginner-card learn-card" style="margin-bottom:0;">
                        <h4 style="margin-bottom:8px; color:var(--accent-blue);">${topic.title}</h4>
                        <p style="font-size:0.95rem; line-height:1.5; color:var(--text-secondary);">${topic.content}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="glass-panel beginner-card" style="background: rgba(59, 130, 246, 0.1);">
            <h3 style="margin-bottom: 20px; text-align: center;">🛡️ ${isKo ? '투자 3계명' : '3 Rules of Investing'}</h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px;">
                ${rules.map(rule => `
                    <div style="text-align:center;">
                        <h4 style="margin-bottom:5px;">${rule.title}</h4>
                        <p style="font-size:0.9rem; opacity:0.8;">${rule.text}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-top: 30px;">
            <h3>👣 ${isKo ? '첫 주식 구매 5단계' : '5 Steps to Your First Stock'}</h3>
            <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                <div class="explanation-bubble" style="margin: 0;">1. ${isKo ? '증권사 계좌 만들기' : 'Open a Brokerage Account'}</div>
                <div class="explanation-bubble" style="margin: 0;">2. ${isKo ? '여유 자금 입금하기' : 'Deposit Funds'}</div>
                <div class="explanation-bubble" style="margin: 0;">3. ${isKo ? '내가 아는 기업 검색하기 (애플, 삼성 등)' : 'Search for a Familiar Company'}</div>
                <div class="explanation-bubble" style="margin: 0;">4. ${isKo ? '현재 가격 확인하고 주문 넣기' : 'Check Price and Place Order'}</div>
                <div class="explanation-bubble" style="margin: 0;">5. ${isKo ? '느긋하게 지켜보기' : 'Wait and Watch'}</div>
            </div>
        </div>
    `;
}
