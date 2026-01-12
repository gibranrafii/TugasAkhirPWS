const axios = require('axios');

// 1. Cari Resep (Search)
const searchRecipes = async (req, res) => {
    try {
        const { q } = req.query; 
        if (!q) return res.status(400).json({ error: "Please provide a query param ?q=" });

        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${q}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch from TheMealDB" });
    }
};

// 2. Detail Resep (INI YANG MUNGKIN HILANG/UNDEFINED)
const getRecipeDetail = async (req, res) => {
    try {
        const { id } = req.params;
        // Fetch detail by ID dari TheMealDB
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch detail" });
    }
};

// JANGAN LUPA EXPORT KEDUANYA
module.exports = { searchRecipes, getRecipeDetail };