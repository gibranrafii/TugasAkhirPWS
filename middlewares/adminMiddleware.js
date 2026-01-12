const verifyAdmin = (req, res, next) => {

    
    // Cek 1: Apakah ada data user?
    // Cek 2: Apakah role-nya 'admin'?
    if (req.user && req.user.role === 'admin') {
        next(); // OK, Silakan masuk
    } else {
        // Kalau bukan admin, tolak!
        return res.status(403).json({ error: "Akses Ditolak! Fitur ini khusus Admin." });
    }
};

module.exports = verifyAdmin;