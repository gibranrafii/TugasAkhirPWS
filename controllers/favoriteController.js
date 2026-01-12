const { Favorite } = require('../models');

const addFavorite = async (req, res) => {
    try {
        const { idMeal, strMeal, strThumb } = req.body;
        const userId = req.user.id; // Dari Token

        // Cek duplikat
        const exists = await Favorite.findOne({ where: { idMeal, userId } });
        if (exists) return res.status(400).json({ message: "Already in favorites" });

        const fav = await Favorite.create({ idMeal, strMeal, strThumb, userId });
        res.status(201).json({ message: "Added to favorites", data: fav });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const favs = await Favorite.findAll({ where: { userId } });
        res.json(favs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeFavorite = async (req, res) => {
    try {
        const { id } = req.params; // ID Favorit (bukan ID Meal)
        const userId = req.user.id;

        // Hapus berdasarkan ID favorit dan User ID (biar gak hapus punya orang lain)
        const deleted = await Favorite.destroy({
            where: { 
                id: id,
                userId: userId 
            }
        });

        if (!deleted) {
            return res.status(404).json({ error: "Favorit tidak ditemukan atau bukan milik Anda" });
        }

        res.json({ message: "Berhasil dihapus dari favorit" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};  

module.exports = { addFavorite, getFavorites, removeFavorite };