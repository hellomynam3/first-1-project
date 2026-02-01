import { renderDashboard } from './js/dashboard.js';
import { renderSimulator } from './js/simulator.js';
import { renderBeginner } from './js/beginner.js';
import { renderSettings } from './js/settings.js';
import { initChatbot } from './js/chatbot.js';
import { renderStockDetail } from './js/stockDetail.js';
import { appSettings, translations, stocks } from './js/store.js'; // Import stocks for search

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    // Modal Elements
    const newsModal = document.getElementById('news-modal');
    const modalContent = document.getElementById('modal-news-content');
    const closeModal = document.querySelector('.close-modal');

    // Search Elements
    const searchInput = document.getElementById('global-search');
    const searchResults = document.getElementById('search-results');

    // Initialize Theme
    applyTheme();

    // Navigation Handler
    function loadView(viewName, param = null) {
        // Update Active State
        navLinks.forEach(link => {
            if (link.dataset.view === viewName) link.classList.add('active');
            else link.classList.remove('active');
        });

        // Clear Content
        contentArea.innerHTML = '';

        // Load Module
        switch(viewName) {
            case 'dashboard':
                renderDashboard(contentArea, handleStockClick, handleNewsClick);
                break;
            case 'simulator':
                renderSimulator(contentArea);
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

    // --- Search Logic ---
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length === 0) {
            searchResults.classList.add('hidden');
            return;
        }

        const matches = stocks.filter(s => 
            s.symbol.toLowerCase().includes(query) || 
            s.name.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            searchResults.innerHTML = matches.map(s => `
                <div class="search-item" data-symbol="${s.symbol}">
                    <div>
                        <span class="search-symbol">${s.symbol}</span>
                        <span class="search-name">${s.name}</span>
                    </div>
                    <div class="search-price">$${s.price}</div>
                </div>
            `).join('');
            searchResults.classList.remove('hidden');

            // Attach click events
            searchResults.querySelectorAll('.search-item').forEach(item => {
                item.addEventListener('click', () => {
                    handleStockClick(item.dataset.symbol);
                    searchInput.value = ''; // Clear input
                    searchResults.classList.add('hidden');
                });
            });
        } else {
            searchResults.innerHTML = `<div class="search-item" style="cursor:default; color:#aaa;">No results found</div>`;
            searchResults.classList.remove('hidden');
        }
    });

    // Close search when clicking outside
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
        // Ensure elements exist (Sidebar text update)
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
        // Re-render current settings view to reflect lang change immediately
        renderSettings(contentArea, handleSettingsUpdate);
    }

    // --- Action Handlers ---

    function handleStockClick(symbol) {
        loadView('stock-detail', symbol);
    }

    function handleNewsClick(newsItem) {
        showNewsModal(newsItem);
    }

    // --- Modal Logic ---

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
                (Full article content would be fetched from the API here. For this demo, we are showing the extended summary.)
                <br><br>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <button style="margin-top: 30px; padding: 10px 20px; background: var(--accent-blue); color: white; border: none; border-radius: 8px; cursor: pointer;">
                Read Full Article <i class="fa-solid fa-external-link-alt"></i>
            </button>
        `;
        newsModal.classList.remove('hidden');
    }

    closeModal.addEventListener('click', () => {
        newsModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === newsModal) {
            newsModal.classList.add('hidden');
        }
    });

    // Attach Click Events to Nav
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const view = link.dataset.view;
            loadView(view);
        });
    });

    // Init App
    updateNavText(); // Initial text set
    loadView('dashboard');
    initChatbot();
});