import { renderDashboard } from './js/dashboard.js';
import { renderSimulator } from './js/simulator.js';
import { renderBeginner } from './js/beginner.js';
import { initChatbot } from './js/chatbot.js';
import { renderStockDetail } from './js/stockDetail.js';

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    // Modal Elements
    const newsModal = document.getElementById('news-modal');
    const modalContent = document.getElementById('modal-news-content');
    const closeModal = document.querySelector('.close-modal');

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
            case 'stock-detail':
                // For detail view, we might not want to highlight any nav link or keep 'dashboard' active
                navLinks.forEach(l => l.classList.remove('active'));
                renderStockDetail(contentArea, param, () => loadView('dashboard')); // Param is symbol
                break;
            default:
                renderDashboard(contentArea, handleStockClick, handleNewsClick);
        }
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
                <span style="color: #aaa; margin-left: 10px;">${news.source}</span>
            </div>
            <h2 style="margin-bottom: 20px; font-size: 1.8rem;">${news.title}</h2>
            <p style="font-size: 1.1rem; line-height: 1.8; color: #ddd;">
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

    // Close on click outside
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
    loadView('dashboard');
    initChatbot();
});