import { news, appSettings, translations } from './store.js';

export function renderNewsPage(container, onNewsClick) {
    const isKo = appSettings.lang === 'ko';
    const t = translations[appSettings.lang];

    container.innerHTML = `
        <div class="news-page-container">
            <h2 style="margin-bottom: 20px;"><i class="fa-regular fa-newspaper"></i> ${isKo ? '시장 뉴스 센터' : 'Market News Center'}</h2>
            
            <div class="news-filters glass-panel" style="margin-bottom: 20px; padding: 15px; display: flex; gap: 10px; overflow-x: auto;">
                <button class="tab-btn active" data-sentiment="all">${isKo ? '전체' : 'All'}</button>
                <button class="tab-btn" data-sentiment="positive">${isKo ? '긍정적' : 'Positive'}</button>
                <button class="tab-btn" data-sentiment="neutral">${isKo ? '중립적' : 'Neutral'}</button>
                <button class="tab-btn" data-sentiment="negative">${isKo ? '부정적' : 'Negative'}</button>
            </div>

            <div id="full-news-feed" class="news-section" style="grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));">
                <!-- News cards will be injected here -->
            </div>
        </div>
    `;

    const feed = document.getElementById('full-news-feed');
    const filterButtons = container.querySelectorAll('.tab-btn');

    const renderFilteredNews = (sentiment) => {
        feed.innerHTML = '';
        const filtered = sentiment === 'all' ? news : news.filter(n => n.sentiment === sentiment);
        
        if (filtered.length === 0) {
            feed.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:50px; color:var(--text-secondary);">
                ${isKo ? '해당 뉴스가 없습니다.' : 'No news found for this category.'}
            </div>`;
            return;
        }

        filtered.forEach(n => {
            const card = document.createElement('div');
            card.className = `glass-panel news-card ${n.sentiment}`;
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase; font-weight:bold;">${n.source}</span>
                    <span class="sentiment-badge ${n.sentiment}">${n.sentiment.toUpperCase()}</span>
                </div>
                <div style="font-weight:bold; font-size:1.1rem; margin-bottom:10px; line-height:1.4;">${n.title}</div>
                <div style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6; margin-bottom:15px;">${n.summary}</div>
                <div style="margin-top:auto; font-size:0.8rem; color:var(--accent-blue);">
                    ${isKo ? '더보기' : 'Read more'} <i class="fa-solid fa-arrow-right"></i>
                </div>
            `;

            card.addEventListener('click', () => {
                if (onNewsClick) onNewsClick(n);
            });

            feed.appendChild(card);
        });
    };

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderFilteredNews(btn.dataset.sentiment);
        });
    });

    // Initial render
    renderFilteredNews('all');
}
