import { renderDashboard } from './js/dashboard.js';
import { renderSimulator } from './js/simulator.js';
import { renderBeginner } from './js/beginner.js';
import { initChatbot } from './js/chatbot.js';

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const navLinks = document.querySelectorAll('.nav-links li');

    // Navigation Handler
    function loadView(viewName) {
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
                renderDashboard(contentArea);
                break;
            case 'simulator':
                renderSimulator(contentArea);
                break;
            case 'beginner':
                renderBeginner(contentArea);
                break;
            default:
                renderDashboard(contentArea);
        }
    }

    // Attach Click Events
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
