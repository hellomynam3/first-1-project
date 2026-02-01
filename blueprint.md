# Stock AI Master V2 Blueprint

## Overview
A comprehensive stock analysis platform featuring a real-time dashboard and deep-dive analytical tools. The application uses a "Sidebar + Main Content" layout to provide quick access to market trends and detailed stock reports.

## Features

### 1. Navigation & UX (Sidebar)
- **Home Access**: "Stock AI Master V2" logo/button to return to the dashboard.
- **My Watchlist**: Categorized buttons for quick access to specific sector leaders.
  - Sectors: Aerospace, AI/Semicon, EV, Domestic Leaders.
  - Action: Clicking a ticker switches to the **Deep Analysis** view.

### 2. Market Dashboard (Home View)
- **Key Indices Cards**:
  - Targets: S&P 500, NASDAQ, Bitcoin, KRW/USD.
  - Content: Price, Change %, and a **Sparkline (Mini-chart)** for 5-day trend.
- **Trending Stocks**:
  - Curated list of hot stocks (NVDA, TSLA, etc.).
  - "Analyze" button to open the deep dive view.

### 3. Deep Analysis (Detail View)
A tabbed interface for comprehensive stock data.

- **Tab 1: 📈 Advanced Chart**
  - **Candlestick Chart**: OHLC data.
  - **Overlays**: 20-day (Orange) and 60-day (Blue) Moving Averages.
  - **Volume**: Color-coded bars (Red/Green).
- **Tab 2: ⚖️ Peer Comparison**
  - Feature: Compare current stock vs. competitor (e.g., NVDA vs. AMD).
  - Visualization: 1-Year Normalized Return (%) Line Chart.
- **Tab 3: 💰 Financials**
  - **Cards**: Market Cap, PER, Revenue.
  - **Analyst Gauge**: Buy/Hold/Sell progress bar & Target Price gap.
- **Tab 4: 🗞️ AI News**
  - **Sentiment Analysis**: Auto-tagging news as "Positive" (Green) or "Negative" (Red) based on keywords (surge, drop, risk, record).
- **Tab 5: 🚀 Simulator (DCA)**
  - **Input**: Investment Duration, Monthly Amount.
  - **Output**: Total Invested, Final Value, Yield %.
  - **Chart**: Asset growth over time.

## Technical Architecture
- **Library**: **ApexCharts** (via CDN) for high-performance financial charting.
- **State Management**: Simple vanilla JS router (`currentView` state).
- **Data**: Advanced mock data generator for historical OHLC prices to support charts and simulations.
- **Styling**: CSS Grid/Flexbox, Dark Mode, Glassmorphism.