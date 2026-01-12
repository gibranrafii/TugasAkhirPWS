const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const crypto = require('crypto');
require('dotenv').config();

// Fungsi bikin API Key Random
const generateKey = () => {
    return 'mykulliner_' + crypto.randomBytes(16).toString('hex');
};

const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Auto Generate API Key saat Register
        const newApiKey = generateKey();

        const newUser = await User.create({ 
            username, 
            password: hashedPassword,
            apiKey: newApiKey 
        });

        res.status(201).json({ 
            message: "User created", 
            data: { 
                username: newUser.username,
                apiKey: newUser.apiKey 
            } 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        // 1. Terima apiKey juga dari body request
        const { username, password, apiKey } = req.body;

        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

        // 2. Cek Password
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Password salah" });

        // 3. === LOGIKA BARU: Cek API Key ===
        // Jika API Key tidak dikirim atau tidak sama dengan di database
        if (!apiKey || user.apiKey !== apiKey) {
            return res.status(401).json({ error: "API Key salah atau tidak valid!" });
        }
        // ====================================

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            process.env.JWT_SECRET || 'rahasia', 
            { expiresIn: '1h' }
        );

        res.json({ 
            message: "Login success", 
            token, 
            role: user.role,
            apiKey: user.apiKey
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fitur Baru: Generate Ulang API Key
const regenerateApiKey = async (req, res) => {
    try {
        const userId = req.user.id; // Diambil dari Middleware JWT
        const newApiKey = generateKey();

        await User.update({ apiKey: newApiKey }, { where: { id: userId } });

        res.json({ message: "API Key berhasil diperbarui", newApiKey });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fitur Recovery API Key yang Lupa
const recoverApiKey = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username dan password harus diisi" });
        }

        // Cari user berdasarkan username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: "User tidak ditemukan" });
        }

        // Verifikasi password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: "Password salah" });
        }

        // Return API key jika credentials valid
        res.json({ 
            message: "API Key ditemukan",
            apiKey: user.apiKey,
            username: user.username
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login, regenerateApiKey, recoverApiKey };