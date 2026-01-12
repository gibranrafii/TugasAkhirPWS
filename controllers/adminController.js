const { User, Recipe } = require('../models');
const axios = require('axios');

// === MANAJEMEN USER ===
const getAllUsers = async (req, res) => {
    try {
        // Ambil semua user, tampilkan id, username, role, dan apiKey
        const users = await User.findAll({ 
            attributes: ['id', 'username', 'role', 'apiKey'] 
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.destroy({ where: { id } });
        res.json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// === MANAJEMEN MENU (REKOMENDASI) ===

// 1. CREATE: Import dari TheMealDB ke Database Lokal
const importRecipe = async (req, res) => {
    try {
        const { idMeal } = req.body; // Admin kirim ID Resep (misal: 52772)
        
        // Cek dulu apakah sudah ada di menu rekomendasi
        const exists = await Recipe.findOne({ where: { idMeal } });
        if (exists) return res.status(400).json({ message: "Menu ini sudah ada di rekomendasi!" });

        // Fetch detail dari API Luar
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
        const data = response.data.meals[0];

        if (!data) return res.status(404).json({ message: "Resep tidak ditemukan di TheMealDB" });

        // Simpan ke Database Lokal
        const newMenu = await Recipe.create({
            idMeal: data.idMeal,
            strMeal: data.strMeal,
            strThumb: data.strMealThumb,
            strCategory: data.strCategory,
            strInstructions: data.strInstructions
        });

        res.status(201).json({ message: "Berhasil diimpor ke Menu Rekomendasi", data: newMenu });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. READ: Lihat semua Menu Rekomendasi (Untuk Admin & User)
const getRecommendations = async (req, res) => {
    try {
        const menus = await Recipe.findAll();
        res.json(menus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. UPDATE: Edit Menu (Misal translate bahasa)
const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params; // ID Database lokal
        const { strMeal, strInstructions } = req.body; // Data yang mau diubah

        await Recipe.update({ strMeal, strInstructions }, { where: { id } });
        res.json({ message: "Menu berhasil diupdate" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. DELETE: Hapus dari Rekomendasi
const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        await Recipe.destroy({ where: { id } });
        res.json({ message: "Menu dihapus dari rekomendasi" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    getAllUsers, deleteUser, 
    importRecipe, getRecommendations, updateRecipe, deleteRecipe 
};