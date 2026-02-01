import { appSettings, saveSettings, translations } from './store.js';

export function renderSettings(container, onUpdate) {
    const t = translations[appSettings.lang];

    container.innerHTML = `
        <div class="settings-container glass-panel" style="padding: 30px;">
            <h2 class="section-title"><i class="fa-solid fa-gear"></i> ${t.settings_title}</h2>
            
            <div class="setting-row">
                <div style="font-size: 1.1rem;">
                    <i class="fa-solid fa-palette"></i> ${t.theme_label}
                </div>
                <div class="toggle-switch">
                    <button class="toggle-btn ${appSettings.theme === 'light' ? 'active' : ''}" data-type="theme" data-val="light"><i class="fa-solid fa-sun"></i> Light</button>
                    <button class="toggle-btn ${appSettings.theme === 'dark' ? 'active' : ''}" data-type="theme" data-val="dark"><i class="fa-solid fa-moon"></i> Dark</button>
                </div>
            </div>

            <div class="setting-row">
                <div style="font-size: 1.1rem;">
                    <i class="fa-solid fa-language"></i> ${t.lang_label}
                </div>
                <div class="toggle-switch">
                    <button class="toggle-btn ${appSettings.lang === 'en' ? 'active' : ''}" data-type="lang" data-val="en">🇺🇸 English</button>
                    <button class="toggle-btn ${appSettings.lang === 'ko' ? 'active' : ''}" data-type="lang" data-val="ko">🇰🇷 한국어</button>
                </div>
            </div>

            <div style="margin-top: 30px; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">
                Stock AI Master v1.2.0
            </div>
        </div>
    `;

    // Event Listeners
    container.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.dataset.type;
            const val = btn.dataset.val;
            
            // Visual Update
            container.querySelectorAll(`[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Save & Trigger
            const newSettings = {};
            newSettings[type] = val;
            saveSettings(newSettings);
            
            if (onUpdate) onUpdate();
        });
    });
}
