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

            <div class="setting-row" style="flex-direction: column; align-items: flex-start; gap: 10px;">
                <div style="font-size: 1.1rem;">
                    <i class="fa-solid fa-key"></i> ${t.apikey_label}
                </div>
                <div style="width: 100%;">
                    <input type="text" id="api-key-input" value="${appSettings.finnhubKey}" placeholder="Paste your Finnhub API key here..." 
                           style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); color: var(--text-primary); padding: 10px; border-radius: 8px; outline: none;">
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 5px;">
                        ${t.apikey_desc}
                    </div>
                </div>
            </div>

            <div class="setting-row" style="flex-direction: column; align-items: flex-start; gap: 10px;">
                <div style="font-size: 1.1rem;">
                    <i class="fa-solid fa-robot"></i> ${t.gemini_apikey_label}
                </div>
                <div style="width: 100%;">
                    <input type="text" id="gemini-key-input" value="${appSettings.geminiKey}" placeholder="Paste your Gemini API key here..." 
                           style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); color: var(--text-primary); padding: 10px; border-radius: 8px; outline: none;">
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 5px;">
                        ${t.gemini_apikey_desc}
                    </div>
                </div>
            </div>

            <div style="margin-top: 20px;">
                <button id="save-settings-btn" style="width: 100%; padding: 12px; background: var(--accent-blue); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    ${t.btn_save}
                </button>
            </div>

            <div style="margin-top: 30px; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">
                Stock AI Master v1.3.0 (Live API Ready)
            </div>
        </div>
    `;

    // Toggle Buttons
    container.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const val = btn.dataset.val;
            saveSettings({ [type]: val });
            if (onUpdate) onUpdate();
        });
    });

    // Save Button
    document.getElementById('save-settings-btn').addEventListener('click', () => {
        const finnhubKey = document.getElementById('api-key-input').value.trim();
        const geminiKey = document.getElementById('gemini-key-input').value.trim();
        saveSettings({ finnhubKey, geminiKey });
        alert(appSettings.lang === 'ko' ? "설정이 저장되었습니다. 데이터를 새로 고침합니다." : "Settings saved. Refreshing data...");
        location.reload(); // Refresh to fetch new live data
    });
}