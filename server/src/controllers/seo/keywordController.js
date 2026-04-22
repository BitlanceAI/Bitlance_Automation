export const getSuggestions = async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
        return res.json({ success: true, suggestions: [] });
    }

    try {
        // Google Autocomplete — free, no API key needed
        const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q.trim())}&hl=en`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const data = await response.json();
        // data[1] is the suggestions array
        const suggestions = (Array.isArray(data[1]) ? data[1] : []).slice(0, 8);
        res.json({ success: true, suggestions });
    } catch {
        res.json({ success: true, suggestions: [] });
    }
};
