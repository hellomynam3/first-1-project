// Global Data Store
// Roles: Holds static configuration data and mock database objects

export const stocks = [
    { 
        symbol: 'NVDA', 
        name: 'NVIDIA Corp', 
        price: 118.50, 
        change: 2.45, 
        volatility: 0.035, 
        roe: 65, 
        debtRatio: 40, 
        profitMargin: 55, 
        sentiment: 'positive',
        sector: 'Technology',
        marketCap: 3100000000000, // 3.1T
        peRatio: 72.5,
        dividend: 0.04,
        analystRating: 'Strong Buy',
        description: "Leading the AI revolution with H100 chips."
    },
    { 
        symbol: 'TSLA', 
        name: 'Tesla Inc', 
        price: 245.30, 
        change: -1.20, 
        volatility: 0.045, 
        roe: 22, 
        debtRatio: 15, 
        profitMargin: 12, 
        sentiment: 'neutral',
        sector: 'Consumer Cyclical',
        marketCap: 780000000000, // 780B
        peRatio: 45.2,
        dividend: 0.0,
        analystRating: 'Hold',
        description: "EV pioneer facing increased competition."
    },
    { 
        symbol: 'AAPL', 
        name: 'Apple Inc', 
        price: 215.00, 
        change: 0.50, 
        volatility: 0.015, 
        roe: 150, 
        debtRatio: 180, 
        profitMargin: 25, 
        sentiment: 'positive',
        sector: 'Technology',
        marketCap: 3300000000000, // 3.3T
        peRatio: 32.1,
        dividend: 0.5,
        analystRating: 'Buy',
        description: "Stable growth with Services and iPhone ecosystem."
    },
    { 
        symbol: 'AMD', 
        name: 'Adv Micro Devices', 
        price: 160.10, 
        change: -0.80, 
        volatility: 0.040, 
        roe: 8, 
        debtRatio: 5, 
        profitMargin: 4, 
        sentiment: 'negative',
        sector: 'Technology',
        marketCap: 260000000000,
        peRatio: 150.4,
        dividend: 0.0,
        analystRating: 'Buy',
        description: "Chasing market share in data centers."
    },
    { 
        symbol: 'MSFT', 
        name: 'Microsoft', 
        price: 450.20, 
        change: 1.15, 
        volatility: 0.018, 
        roe: 38, 
        debtRatio: 45, 
        profitMargin: 36, 
        sentiment: 'positive',
        sector: 'Technology',
        marketCap: 3200000000000,
        peRatio: 36.8,
        dividend: 0.7,
        analystRating: 'Strong Buy',
        description: "Cloud computing and enterprise AI dominance."
    },
    { 
        symbol: 'JPM', 
        name: 'JPMorgan Chase', 
        price: 198.50, 
        change: -0.45, 
        volatility: 0.020, 
        roe: 16, 
        debtRatio: 250, 
        profitMargin: 34, 
        sentiment: 'neutral',
        sector: 'Financial',
        marketCap: 570000000000,
        peRatio: 11.5,
        dividend: 2.4,
        analystRating: 'Buy',
        description: "Largest US bank, benefiting from high rates."
    },
    { 
        symbol: 'SPY', 
        name: 'S&P 500 ETF', 
        price: 540.20, 
        change: 0.35, 
        volatility: 0.010, 
        type: 'index',
        description: "Market Benchmark"
    },
    { 
        symbol: 'QQQ', 
        name: 'Nasdaq 100 ETF', 
        price: 475.50, 
        change: 0.60, 
        volatility: 0.015, 
        type: 'index',
        description: "Tech Heavy"
    },
    { 
        symbol: 'BTC', 
        name: 'Bitcoin', 
        price: 67500.00, 
        change: 3.20, 
        volatility: 0.050, 
        type: 'crypto',
        description: "Digital Gold"
    },
];

export const news = [
    { title: "Fed signals potential rate cuts later this year", source: "Bloomberg", sentiment: "positive", summary: "Inflation cooling down prompts discussion of dovish policy shift." },
    { title: "Tech sector faces headwinds from supply chain issues", source: "Reuters", sentiment: "negative", summary: "Chip shortage may persist into Q4, affecting hardware sales." },
    { title: "NVIDIA announces new AI chip architecture", source: "TechCrunch", sentiment: "positive", summary: "The 'Rubin' platform promises 2x performance per watt." },
    { title: "Oil prices stabilize amidst global uncertainty", source: "CNBC", sentiment: "neutral", summary: "OPEC+ maintains production cuts as demand forecast remains steady." },
    { title: "Apple integrates ChatGPT into iOS 18", source: "The Verge", sentiment: "positive", summary: "Major AI overhaul coming to iPhone this fall." }
];

export const translations = {
    en: {
        nav_dashboard: "Dashboard",
        nav_quant: "Quant Tool",
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
        btn_save: "Save Settings",
        mcap: "MCap",
        per: "P/E",
        div: "Div",
        rating: "Analyst",
        back_dashboard: "Back to Dashboard",
        ai_analysis: "AI Analysis",
        related_news: "Related News",
        key_stats: "Key Statistics"
    },
    ko: {
        nav_dashboard: "대시보드",
        nav_quant: "퀀트 분석",
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
        btn_save: "설정 저장",
        mcap: "시총",
        per: "PER",
        div: "배당",
        rating: "투자의견",
        back_dashboard: "대시보드로 돌아가기",
        ai_analysis: "AI 심층 분석",
        related_news: "관련 뉴스",
        key_stats: "핵심 지표"
    }
};

// Simple State Management for Settings
export let appSettings = {
    theme: localStorage.getItem('theme') || 'dark',
    lang: localStorage.getItem('lang') || 'en'
};

export function saveSettings(newSettings) {
    appSettings = { ...appSettings, ...newSettings };
    localStorage.setItem('theme', appSettings.theme);
    localStorage.setItem('lang', appSettings.lang);
}