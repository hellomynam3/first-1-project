# Stock AI Master V3 - Pro Trader Dashboard

## Overview
A high-density, professional-grade stock analysis interface inspired by TradingView and Bloomberg terminals. The focus shifts from "minimalism" to **information density**, **real-time data visualization**, and **technical layout**.

## Design Philosophy: "The Pro Desk"
- **Theme**: Dark Mode (Deep Gunmetal/Black).
- **Layout**: 3-Column Fixed Layout (Watchlist - Main Chart - Order Book).
- **Typography**: Monospace numerals for rapid scanning. Compact labels.
- **Color Coding**: **Green (Up) / Red (Down)** (Standard International/US Style).
- **Interactivity**: Hover effects on charts, active tab switching, rapid ticker updates.

## UI Structure

### 1. Global Elements
- **Ticker Tape**: A scrolling bar at the very top displaying global indices.
- **Header**: Compact utility bar (Logo, Search, Time, Connection Status).

### 2. Left Sidebar: Watchlist
- **List View**: Dense list of tickers.
- **Columns**: Symbol | Last Price | Chg %.
- **Mini-Charts**: Removed to save space for data density, or kept very subtle.

### 3. Center Panel: The Workspace
- **Symbol Header**: OHLCV (Open, High, Low, Close, Volume) data bar.
- **Main Chart**: Large Candlestick chart (60% height).
- **Analysis Tabs**: Financials, News, Comparison, Technicals (below chart).

### 4. Right Panel: Market Depth (New)
- **Order Book**: Simulated Bid/Ask table (Price | Size | Total).
- **Recent Trades**: Rolling list of last executed trades.

## Technical Updates
- **Grid Layout**: CSS Grid for rigid, resize-friendly paneling.
- **Scrollbars**: Custom slim scrollbars.
- **Charts**: Advanced ApexCharts configuration (candlestick + volume + toolbar).