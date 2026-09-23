# Market Command Center

Stock dashboard for US equities and ETFs. Quotes, company details, available price history, and market/company news are shown inside the application.

## Data setup

This static site requires a Finnhub API key. Enter it in **Settings** once in the browser. Until a key is set, the app shows an unavailable state instead of demo prices. The key is stored in that browser's localStorage, so each browser needs its own key. Do not commit a key to the repository.

The dashboard fetches verified quotes for AAPL, TSLA, NVDA, AMD, MSFT, JPM, SPY, and QQQ. Search can retrieve other US symbols. Opening a stock fetches a fresh quote, company profile, reported metrics, available historical closes, and company news. Data availability and delay depend on the API account and plan. Missing metrics, charts, or quotes are shown as unavailable; no demo values are substituted.

This is a static client-side app. To let every visitor see market data without configuring a key, deploy a server-side API proxy with a provider key stored as a hosting secret, then point the frontend to that proxy. Do not publish a shared provider key in browser code.

## Development

Serve the repository through a local HTTP server and open `index.html`. Browser requests to Finnhub require connectivity and a valid API key. The optional AI features require a separate Gemini key.
