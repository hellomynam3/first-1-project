import { renderDashboard } from './js/dashboard.js';
import { renderSimulator } from './js/simulator.js';
import { renderBeginner } from './js/beginner.js';
import { renderSettings } from './js/settings.js';
import { initChatbot } from './js/chatbot.js';
import { renderStockDetail } from './js/stockDetail.js';
import { appSettings, translations, stocks, initializeStore } from './js/store.js';
import { fetchMarketData, searchStocks, fetchStockDetails } from './js/api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const contentArea = document.getElementById('content-area');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    // Modal Elements
    const newsModal = document.getElementById('news-modal');
    const modalContent = document.getElementById('modal-news-content');
    const closeModal = document.querySelector('.close-modal');

    // Search Elements
    const searchInput = document.getElementById('global-search');
    const searchResults = document.getElementById('search-results');

    // 1. Fetch Data First
    contentArea.innerHTML = '<div style="text-align:center; padding-top:50px;">Loading Market Data...</div>';
    const data = await fetchMarketData();
    initializeStore(data);

    // 2. Initialize Theme
    applyTheme();

    // Navigation Handler
    function loadView(viewName, param = null) {
        navLinks.forEach(link => {
            if (link.dataset.view === viewName) link.classList.add('active');
            else link.classList.remove('active');
        });

        contentArea.innerHTML = '';

        switch(viewName) {
            case 'dashboard':
                renderDashboard(contentArea, handleStockClick, handleNewsClick);
                break;
            case 'beginner':
                renderBeginner(contentArea);
                break;
            case 'settings':
                renderSettings(contentArea, handleSettingsUpdate);
                break;
            case 'stock-detail':
                navLinks.forEach(l => l.classList.remove('active'));
                renderStockDetail(contentArea, param, () => loadView('dashboard')); 
                break;
            default:
                renderDashboard(contentArea, handleStockClick, handleNewsClick);
        }
        
        updateNavText();
    }

    // --- Search Logic (Enhanced) ---
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length === 0) {
            searchResults.classList.add('hidden');
            return;
        }

        // Debounce API calls
        debounceTimer = setTimeout(async () => {
            // 1. Local Search first
            let matches = stocks.filter(s => 
                s.symbol.toLowerCase().includes(query) || 
                s.name.toLowerCase().includes(query) ||
                (s.sector && s.sector.toLowerCase().includes(query))
            ).map(s => ({...s, isLocal: true}));

            // 2. API Search (if key exists)
            const apiResults = await searchStocks(query);
            if (apiResults) {
                // Filter out common stocks and format
                const remoteMatches = apiResults
                    .filter(r => !r.symbol.includes('.')) // Simple filter for US stocks mostly
                    .slice(0, 5) // Limit to 5 remote results
                    .map(r => ({
                        symbol: r.symbol,
                        name: r.description,
                        price: 'Click to Load',
                        isLocal: false
                    }));
                
                // Merge (deduplicate by symbol)
                const existingSymbols = new Set(matches.map(m => m.symbol));
                remoteMatches.forEach(r => {
                    if (!existingSymbols.has(r.symbol)) {
                        matches.push(r);
                    }
                });
            }

            // Render Results
            if (matches.length > 0) {
                searchResults.innerHTML = matches.map(s => `
                    <div class="search-item" data-symbol="${s.symbol}" data-islocal="${s.isLocal}">
                        <div>
                            <span class="search-symbol">${s.symbol}</span>
                            <span class="search-name">${s.name}</span>
                        </div>
                        <div class="search-price">${s.price === 'Click to Load' ? '<i class="fa-solid fa-cloud-arrow-down"></i>' : '$'+s.price}</div>
                    </div>
                `).join('');
                searchResults.classList.remove('hidden');

                searchResults.querySelectorAll('.search-item').forEach(item => {
                    item.addEventListener('click', async () => {
                        const symbol = item.dataset.symbol;
                        const isLocal = item.dataset.islocal === 'true';

                        searchInput.value = '';
                        searchResults.classList.add('hidden');

                        if (isLocal) {
                            handleStockClick(symbol);
                        } else {
                            // Fetch full details for new stock then show
                            contentArea.innerHTML = '<div style="text-align:center; padding-top:50px;">Fetching Stock Details...</div>';
                            const newStock = await fetchStockDetails(symbol);
                            if (newStock) {
                                // Add to local store temporarily so detailed view works
                                stocks.push(newStock); 
                                handleStockClick(symbol);
                            } else {
                                alert("Failed to load stock details.");
                                loadView('dashboard');
                            }
                        }
                    });
                });
            } else {
                searchResults.innerHTML = `<div class="search-item" style="cursor:default; color:#aaa;">No results found</div>`;
                searchResults.classList.remove('hidden');
            }
        }, 300); // 300ms delay
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });

    // --- Helpers ---
    function applyTheme() {
        if (appSettings.theme === 'light') {
            document.body.setAttribute('data-theme', 'light');
        } else {
            document.body.removeAttribute('data-theme');
        }
    }

    function updateNavText() {
        const t = translations[appSettings.lang];
        const navMap = {
            'dashboard': t.nav_dashboard,
            'simulator': t.nav_quant,
            'beginner': t.nav_easy,
            'settings': t.nav_settings
        };
        
        navLinks.forEach(link => {
            const view = link.dataset.view;
            const span = link.querySelector('span');
            if (span && navMap[view]) {
                span.textContent = navMap[view];
            }
        });
    }

    function handleSettingsUpdate() {
        applyTheme();
        updateNavText();
        renderSettings(contentArea, handleSettingsUpdate);
    }

    function handleStockClick(symbol) {
        loadView('stock-detail', symbol);
    }

    function handleNewsClick(newsItem) {
        showNewsModal(newsItem);
    }

    function showNewsModal(news) {
        modalContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <span class="sentiment-badge ${news.sentiment}" style="font-size: 0.9rem;">${news.sentiment.toUpperCase()}</span>
                <span style="color: var(--text-secondary); margin-left: 10px;">${news.source}</span>
            </div>
            <h2 style="margin-bottom: 20px; font-size: 1.8rem;">${news.title}</h2>
            <p style="font-size: 1.1rem; line-height: 1.8; color: var(--text-primary);">
                ${news.summary}
                <br><br>
                (Full article content would be fetched from the API here.)
            </p>
            <button style="margin-top: 30px; padding: 10px 20px; background: var(--accent-blue); color: white; border: none; border-radius: 8px; cursor: pointer;">
                Read Full Article <i class="fa-solid fa-external-link-alt"></i>
            </button>
        `;
        newsModal.classList.remove('hidden');
    }

    closeModal.addEventListener('click', () => newsModal.classList.add('hidden'));
    window.addEventListener('click', (e) => { if (e.target === newsModal) newsModal.classList.add('hidden'); });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const view = link.dataset.view;
            loadView(view);
        });
    });

    updateNavText();
    loadView('dashboard');
    initChatbot();
});