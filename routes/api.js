const express = require('express');
const router = express.Router();

// === 1. IMPORT CONTROLLERS ===
const authController = require('../controllers/authController');
const recipeController = require('../controllers/recipeController');
const favoriteController = require('../controllers/favoriteController');
const adminController = require('../controllers/adminController'); // Wajib ada

// === 2. IMPORT MIDDLEWARE ===
const authenticate = require('../middlewares/authMiddleware');
const verifyAdmin = require('../middlewares/adminMiddleware'); // Wajib ada

// ================= ROUTES =================

// --- AUTHENTICATION ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/recover-key', authController.recoverApiKey);

router.post('/auth/regenerate-key', authenticate, authController.regenerateApiKey);

// --- RECIPES (Public / User Biasa) ---
// 1. Cari resep dari API Luar (TheMealDB)
router.get('/recipes/search', authenticate, recipeController.searchRecipes);
// 2. Lihat detail resep (PENTING untuk halaman detail.html)
router.get('/recipes/detail/:id', authenticate, recipeController.getRecipeDetail);
// 3. Lihat Menu Rekomendasi Admin (Dari Database Lokal)
router.get('/recipes/recommendations', authenticate, adminController.getRecommendations);

// --- FAVORITES (User Pribadi) ---
router.post('/favorites', authenticate, favoriteController.addFavorite);
router.get('/favorites', authenticate, favoriteController.getFavorites);
router.delete('/favorites/:id', authenticate, favoriteController.removeFavorite);

// --- ADMIN PANEL (Wajib Login & Wajib Role Admin) ---

// A. Manajemen Menu (Rekomendasi)
router.post('/admin/recipes', authenticate, verifyAdmin, adminController.importRecipe);       // Import dari TheMealDB
router.put('/admin/recipes/:id', authenticate, verifyAdmin, adminController.updateRecipe);    // Edit Menu
router.delete('/admin/recipes/:id', authenticate, verifyAdmin, adminController.deleteRecipe); // Hapus Menu

// B. Manajemen User
router.get('/admin/users', authenticate, verifyAdmin, adminController.getAllUsers);           // Lihat semua user
router.delete('/admin/users/:id', authenticate, verifyAdmin, adminController.deleteUser);     // Hapus user

module.exports = router;