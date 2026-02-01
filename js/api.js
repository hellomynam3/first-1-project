// API Service
// Roles: Handles fetching data from external sources (JSON files or real APIs)

export async function fetchMarketData() {
    try {
        // In a real app, this would be: fetch('https://api.example.com/stocks')
        const response = await fetch('./stocks.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch stocks:', error);
        return { stocks: [], news: [] };
    }
}
