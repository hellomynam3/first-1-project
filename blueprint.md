# Market Command Center - The Hybrid Stock Platform

## Overview
A comprehensive stock analysis platform combining the intuitiveness of **Toss Securities** with professional **Quant/Backtesting tools**. The application features a modern **Glassmorphism** design and caters to all user levels, from beginners to experts.

## Core Features

### 1. 🏠 Main Dashboard (Market Command Center)
- **Glassmorphism Design:** Modern, translucent UI.
- **Market Status:** Real-time NY Market Open/Close status.
- **Mini Indicators:** Sparklines for S&P 500, Nasdaq, BTC, etc.
- **Watchlist:** Visual cards with color-coded price changes.
- **Sentiment News:** AI-analyzed news (Green/Red borders).

### 2. 🚀 Pro Quant Tool (Simulator)
- **Financial Health Score:** S-C Grading based on fundamentals (ROE, etc.).
- **Monte Carlo Simulation:** 1,000-run price prediction visualizations.
- **DCA Calculator:** "If I bought $500 monthly..."
- **RSI Backtesting:** Strategy comparison (RSI vs. Buy&Hold).
- **Competitor Comparison:** Multi-stock yield charts.

### 3. 🐣 Beginner Mode (Easy Mode)
- **Conversational Analytics:** "High PER" -> "Expensive stock price relative to earnings."
- **Enhanced Analysis:** New "Profitability" and "Debt Health" cards with simple metaphors.
- **Investment Simulator:** "What If" calculator ("If I invested $1k a year ago...").
- **Investor Personality Test:** A fun quiz to determine risk tolerance.
- **Learning Hub:** Interactive cards explaining stock market basics.
- **52-Week Range:** Visual progress bar.
- **Glossary:** Built-in term lookup.

### 4. 💬 AI Assistant
- **Floating Chatbot:** Always accessible.
- **Q&A:** Instant definitions and market help.

## Technical Architecture (Web Port)
Translating the Python/Streamlit concept to a robust **HTML/CSS/JS** architecture.

- **Frontend:** Vanilla JavaScript (ES Modules).
- **Styling:** CSS3 Variables, Backdrop Filter (Blur), Flexbox/Grid.
- **Visualization:** Chart.js (via CDN).
- **Data Layer:** `js/data_loader.js` (Mocking the Python backend logic).

## Implementation Plan
1.  **Project Structure:** Set up `js/` modules corresponding to the requested "views".
2.  **Design System:** Implement `style.css` with Glassmorphism theme.
3.  **Data Core:** Build `data_loader.js` with mock stock data and math functions (Monte Carlo/RSI).
4.  **Dashboard View:** Implement the main landing view.
5.  **Simulator View:** Implement charts and calculators.
6.  **Beginner/Chat:** Implement the simplified UI and floating bot.
