// Global Data Store
// Roles: Holds the current state of the application

export let stocks = [];
export let news = [];
export let portfolio = JSON.parse(localStorage.getItem('portfolio')) || [];
export let watchlist = JSON.parse(localStorage.getItem('watchlist')) || ['AAPL', 'TSLA', 'NVDA', 'MSFT'];

// This will be called on app initialization
export function initializeStore(data) {
    stocks = data.stocks || [];
    news = data.news || [];
}

export function savePortfolio(newPortfolio) {
    portfolio = newPortfolio;
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
}

export function saveWatchlist(newWatchlist) {
    watchlist = newWatchlist;
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

export function addToPortfolio(symbol, price, quantity) {
    const existing = portfolio.find(p => p.symbol === symbol);
    if (existing) {
        // Weighted Average Price
        const totalCost = (existing.avgPrice * existing.quantity) + (price * quantity);
        const totalQty = existing.quantity + quantity;
        existing.avgPrice = totalCost / totalQty;
        existing.quantity = totalQty;
    } else {
        portfolio.push({ symbol, avgPrice: price, quantity });
    }
    savePortfolio(portfolio);
}

export function removeFromPortfolio(symbol) {
    const newPortfolio = portfolio.filter(p => p.symbol !== symbol);
    savePortfolio(newPortfolio);
}

export function addToWatchlist(symbol) {
    if (!watchlist.includes(symbol)) {
        watchlist.push(symbol);
        saveWatchlist(watchlist);
    }
}

export function removeFromWatchlist(symbol) {
    const newWatchlist = watchlist.filter(s => s !== symbol);
    saveWatchlist(newWatchlist);
}

export const translations = {
    en: {
        nav_dashboard: "Dashboard",
        nav_easy: "Easy Mode",
        nav_settings: "Settings",
        market_open: "US Market is Open",
        market_closed: "US Market is Closed",
        indices: "Major Indices",
        sectors: "Sector Performance",
        watchlist: "Your Watchlist",
        news: "AI Sentiment News",
        health_score: "Financial Health Score",
        dca_calc: "DCA Calculator",
        monte_carlo: "Monte Carlo Simulation (1 Year)",
        easy_title: "Easy Mode Stock Analysis",
        easy_desc: "Choose a Stock to Learn About:",
        settings_title: "Preferences",
        theme_label: "App Theme",
        lang_label: "Language",
        apikey_label: "Finnhub API Key",
        gemini_apikey_label: "Gemini API Key (Optional)",
        apikey_desc: "Get a free key at finnhub.io",
        gemini_apikey_desc: "Get a free key at aistudio.google.com for smarter chat",
        btn_save: "Save Settings",
        mcap: "MCap",
        per: "P/E",
        div: "Div",
        rating: "Analyst",
        back_dashboard: "Back to Dashboard",
        ai_analysis: "AI Analysis",
        related_news: "Related News",
        key_stats: "Key Statistics",
        portfolio: "My Portfolio",
        total_profit: "Total Profit",
        add_holding: "Add Holding",
        symbol: "Symbol",
        buy_price: "Buy Price",
        qty: "Qty",
        add: "Add",
        edit_watchlist: "Edit Watchlist"
    },
    ko: {
        nav_dashboard: "대시보드",
        nav_easy: "초보자 모드",
        nav_settings: "설정",
        market_open: "미국장 개장",
        market_closed: "미국장 휴장",
        indices: "주요 지수",
        sectors: "섹터별 현황",
        watchlist: "내 관심 종목",
        news: "AI 감성 뉴스",
        health_score: "재무 건전성 점수",
        dca_calc: "적립식 투자 계산기",
        monte_carlo: "몬테카를로 미래 예측 (1년)",
        easy_title: "주식 초보 탈출기",
        easy_desc: "분석할 종목을 선택하세요:",
        settings_title: "환경 설정",
        theme_label: "앱 테마",
        lang_label: "언어 설정",
        apikey_label: "Finnhub API 키",
        gemini_apikey_label: "Gemini API 키 (선택)",
        apikey_desc: "finnhub.io에서 무료 키를 발급받으세요",
        gemini_apikey_desc: "스마트 채팅을 위해 aistudio.google.com에서 무료 키를 받으세요",
        btn_save: "설정 저장",
        mcap: "시총",
        per: "PER",
        div: "배당",
        rating: "투자의견",
        back_dashboard: "대시보드로 돌아가기",
        ai_analysis: "AI 심층 분석",
        related_news: "관련 뉴스",
        key_stats: "핵심 지표",
        portfolio: "내 자산 현황",
        total_profit: "총 평가손익",
        add_holding: "자산 추가",
        symbol: "종목코드",
        buy_price: "매수가",
        qty: "수량",
        add: "추가",
        edit_watchlist: "관심종목 편집"
    }
};

export let appSettings = {
    theme: localStorage.getItem('theme') || 'dark',
    lang: localStorage.getItem('lang') || 'en',
    finnhubKey: localStorage.getItem('finnhubKey') || '',
    geminiKey: localStorage.getItem('geminiKey') || ''
};

export function saveSettings(newSettings) {
    appSettings = { ...appSettings, ...newSettings };
    localStorage.setItem('theme', appSettings.theme);
    localStorage.setItem('lang', appSettings.lang);
    if (newSettings.finnhubKey !== undefined) {
        localStorage.setItem('finnhubKey', appSettings.finnhubKey);
    }
    if (newSettings.geminiKey !== undefined) {
        localStorage.setItem('geminiKey', appSettings.geminiKey);
    }
}
