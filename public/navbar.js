function renderNavbar() {
    const role = localStorage.getItem('role');
    
    // Logika tombol Admin: Hanya muncul jika role === 'admin'
    // Kita pakai ternary operator (kondisi ? benar : salah)
    const adminMenu = (role === 'admin') 
        ? `<li class="nav-item">
             <a class="nav-link text-warning fw-bold border border-warning rounded me-2 px-3" href="admin.html">
                🛡️ Admin Panel
             </a>
           </li>` 
        : ''; // Kalau bukan admin, kosongkan

    // Logika tombol Back: Hanya muncul jika bukan di index.html dan di favorites.html
    const backButton = (window.location.pathname === '/favorites.html') 
        ? `<button class="btn btn-outline-light btn-sm me-2" onclick="history.back()" title="Kembali ke halaman sebelumnya">
                <i class="fas fa-arrow-left me-1"></i>Back
            </button>`
        : '';

    // HTML Navbar dengan tombol back yang bersyarat
    const navHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-4 sticky-top mb-4">
        <div class="container-fluid">
            <a class="navbar-brand" href="index.html">🍳 MyKulliner</a>
            
            ${backButton}
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-center">
                    
                    ${adminMenu}

                    <li class="nav-item">
                        <a class="nav-link" href="favorites.html">⭐ Favorit Saya</a>
                    </li>
                    <li class="nav-item">
                        <button class="btn btn-danger btn-sm ms-2" onclick="logout()">Logout</button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    `;

    // Masukkan HTML di atas ke dalam elemen dengan ID "navbar-placeholder"
    const placeholder = document.getElementById('navbar-placeholder');
    if (placeholder) {
        placeholder.innerHTML = navHTML;
    }
}