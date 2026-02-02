export function initChatbot() {
    const fab = document.getElementById('chat-fab');
    const window = document.getElementById('chat-window');
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-chat');
    const input = document.getElementById('chat-input-field');
    const messages = document.getElementById('chat-messages');

    fab.addEventListener('click', () => {
        window.classList.remove('hidden');
        fab.classList.add('hidden'); // Optional: hide FAB when open
        input.focus();
    });

    closeBtn.addEventListener('click', () => {
        window.classList.add('hidden');
        fab.classList.remove('hidden');
    });

    sendBtn.addEventListener('click', () => sendMessage());
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // User Message
        appendMessage(text, 'user');
        input.value = '';

        // Bot Response (Simulated Delay)
        setTimeout(() => {
            const response = generateResponse(text);
            appendMessage(response, 'bot');
        }, 600);
    }

    function appendMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }
}

function generateResponse(input) {
    input = input.toLowerCase();

    if (input.includes('rsi')) {
        return "RSI (Relative Strength Index) measures the speed and change of price movements. RSI > 70 usually means 'Overbought' (Expensive), and RSI < 30 means 'Oversold' (Cheap).";
    }
    if (input.includes('per') || input.includes('pe ratio')) {
        return "PER (Price-to-Earnings) compares a company's share price to its earnings per share. It helps you understand if a stock is overvalued or undervalued.";
    }
    if (input.includes('nvda') || input.includes('nvidia')) {
        return "NVIDIA is currently a market leader in AI chips. Its stock has high volatility but strong growth momentum due to AI demand.";
    }
    if (input.includes('buy') || input.includes('sell')) {
        return "I cannot give financial advice! However, checking the 'Quant Tool' tab can help you test your strategies before investing.";
    }
    if (input.includes('hello') || input.includes('hi')) {
        return "Hello! I'm your AI Market Assistant. Ask me about stock terms or market trends.";
    }

    return "That's a great question. While I'm still learning, I recommend checking the 'Easy Mode' for definitions of complex terms.";
}
