// Global Data Store
// Roles: Holds the current state of the application

export let stocks = [];
export let news = [];

// This will be called on app initialization
export function initializeStore(data) {
    stocks = data.stocks || [];
    news = data.news || [];
}

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

export let appSettings = {
    theme: localStorage.getItem('theme') || 'dark',
    lang: localStorage.getItem('lang') || 'en'
};

export function saveSettings(newSettings) {
    appSettings = { ...appSettings, ...newSettings };
    localStorage.setItem('theme', appSettings.theme);
    localStorage.setItem('lang', appSettings.lang);
}
