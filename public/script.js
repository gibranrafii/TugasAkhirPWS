const API_URL = 'http://localhost:3000/api';

// ==========================================
// 1. AUTHENTICATION & UTILS
// ==========================================

function checkAuth(requiredRole = null) {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    if (requiredRole === 'admin' && role !== 'admin') {
        alert("Akses Ditolak! Halaman ini khusus Admin.");
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 1. Ambil value API Key dari input baru
    const apiKey = document.getElementById('loginApiKey').value;

    // console.log("Mencoba login..."); 

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // 2. Kirim apiKey ke backend
            body: JSON.stringify({ username, password, apiKey })
        });
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('apiKey', data.apiKey);

            // Redirect Logic
            if (data.role === 'admin') window.location.href = 'admin.html';
            else window.location.href = 'index.html';
        } else {
            alert(data.error || 'Login Gagal');
        }
    } catch (err) { console.error(err); }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    // Tombol loading state (opsional, biar keren)
    const btn = e.target.querySelector('button');
    const oldText = btn.innerText;
    btn.innerText = 'Memproses...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json(); // Ambil respon JSON (isinya ada apiKey)

        if (res.ok) {
            // 1. Sembunyikan Form Register
            document.getElementById('registerSection').classList.add('d-none');

            // 2. Munculkan Bagian Sukses
            document.getElementById('successSection').classList.remove('d-none');

            // 3. Masukkan Data Username & API Key ke Tampilan
            document.getElementById('displayUsername').innerText = data.data.username;
            document.getElementById('newApiKey').value = data.data.apiKey; // Ambil key dari respon backend

        } else {
            alert(data.error || 'Gagal Register');
            btn.innerText = oldText;
            btn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan koneksi");
        btn.innerText = oldText;
        btn.disabled = false;
    }
}

// ==========================================
// 2. DASHBOARD USER (index.html)
// ==========================================

function handleEnter(e) {
    if (e.key === 'Enter') {
        searchRecipes();
    }
}

// Load Rekomendasi Admin (Dari DB Lokal)
async function loadRecommendations() {
    const list = document.getElementById('recommendationList');
    if (!list) return;

    try {
        const res = await fetch(`${API_URL}/recipes/recommendations`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();

        list.innerHTML = '';
        if (data.length === 0) {
            list.innerHTML = '<p class="text-muted">Belum ada rekomendasi dari Admin.</p>';
            return;
        }

        data.forEach(meal => {
            list.innerHTML += `
                <div class="col-md-3">
                    <div class="card h-100 border-warning shadow-sm">
                        <img src="${meal.strThumb}" class="card-img-top" style="height: 200px; object-fit: cover;">
                        <div class="card-body">
                            <h6 class="card-title text-danger">🔥 ${meal.strMeal}</h6>
                            <div class="d-grid gap-2">
                                <a href="detail.html?id=${meal.idMeal}" class="btn btn-sm btn-primary">Lihat Detail</a>
                                <button onclick="addToFav('${meal.idMeal}', '${meal.strMeal}', '${meal.strThumb}')" class="btn btn-sm btn-outline-danger">❤ Favorit</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (err) { console.error(err); }
}

// Search TheMealDB (Pencarian Bebas)
async function searchRecipes() {
    const query = document.getElementById('searchInput').value;
    const list = document.getElementById('searchList');
    const title = document.getElementById('searchTitle'); // Judul baru tadi

    if (!query) return alert("Ketik nama makanan dulu!");

    // Tampilkan loading & Judul
    title.classList.remove('d-none'); // Munculkan judul "Hasil Pencarian"
    list.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2 text-muted">Sedang mencari resep...</p></div>';

    // Scroll halus ke bawah (UX Improvement)
    title.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
        const res = await fetch(`${API_URL}/recipes/search?q=${query}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();

        list.innerHTML = ''; // Kosongkan loading

        if (data.meals) {
            data.meals.forEach(meal => {
                // ... (Kode render kartu resep sama seperti sebelumnya) ...
                list.innerHTML += `
                    <div class="col-md-3">
                        <div class="card h-100 shadow-sm border-0">
                            <img src="${meal.strMealThumb}" class="card-img-top" loading="lazy">
                            <div class="card-body">
                                <h6 class="card-title fw-bold text-dark">${meal.strMeal}</h6>
                                <div class="d-grid gap-2 mt-3">
                                    <a href="detail.html?id=${meal.idMeal}" class="btn btn-sm btn-primary">Lihat Detail</a>
                                    <button onclick="addToFav('${meal.idMeal}', '${meal.strMeal}', '${meal.strMealThumb}')" class="btn btn-sm btn-outline-danger">❤ Favorit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            list.innerHTML = `
                <div class="col-12 text-center py-5">
                    <h3 class="text-muted">🍽️</h3>
                    <p class="text-muted">Resep "<strong>${query}</strong>" tidak ditemukan.<br>Coba kata kunci lain (bhs Inggris), misal: <em>Chicken</em>.</p>
                </div>`;
        }
    } catch (err) { console.error(err); }
}

// ==========================================
// 3. DETAIL PAGE (detail.html)
// ==========================================

async function loadRecipeDetail() {
    // 1. Ambil ID dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const source = urlParams.get('source'); // <--- Cek apakah dari halaman favorit?

    if (!id) return;

    const container = document.getElementById('recipeDetail');

    try {
        const res = await fetch(`${API_URL}/recipes/detail/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const meal = data.meals[0];

        // 2. LOGIKA BAHAN (Ingredients Loop)
        // API TheMealDB memisahkan bahan di strIngredient1 - strIngredient20
        let ingredientsHtml = '<ul class="list-group list-group-flush">';
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];

            // Jika bahan ada dan tidak kosong, masukkan ke list
            if (ingredient && ingredient.trim() !== "") {
                ingredientsHtml += `
                    <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                        <span>${ingredient}</span>
                        <span class="badge bg-light text-dark rounded-pill border">${measure}</span>
                    </li>`;
            }
        }
        ingredientsHtml += '</ul>';

        // 3. LOGIKA INTRUKSI (Ganti baris baru jadi paragraf biar rapi)
        const instructions = meal.strInstructions.replace(/\r\n/g, '<br><br>');

        // 4. LOGIKA TOMBOL FAVORIT
        // Jika source == 'favorites', tombol disembunyikan (d-none)
        const favButtonClass = source === 'favorites' ? 'd-none' : 'btn btn-danger w-100 rounded-pill py-2 shadow';

        // 5. RENDER TAMPILAN BARU
        container.innerHTML = `
            <div class="col-md-5">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                    <img src="${meal.strMealThumb}" class="img-fluid" alt="${meal.strMeal}">
                    <div class="card-body text-center bg-white">
                        <h2 class="fw-bold mb-1">${meal.strMeal}</h2>
                        <span class="badge bg-warning text-dark me-1"><i class="fas fa-utensils"></i> ${meal.strCategory}</span>
                        <span class="badge bg-info text-white"><i class="fas fa-map-marker-alt"></i> ${meal.strArea}</span>
                    </div>
                </div>

                <div class="d-grid gap-2 mb-4">
                    <button onclick="addToFav('${meal.idMeal}', '${meal.strMeal}', '${meal.strMealThumb}')" class="${favButtonClass}">
                        <i class="fas fa-heart"></i> Simpan ke Favorit
                    </button>
                    
                    ${meal.strYoutube ? `
                    <a href="${meal.strYoutube}" target="_blank" class="btn btn-outline-danger w-100 rounded-pill">
                        <i class="fab fa-youtube"></i> Tonton Video Memasak
                    </a>` : ''}
                </div>

                <div class="card border-0 shadow-sm rounded-4">
                    <div class="card-header bg-white border-0 pt-4 px-4">
                        <h5 class="fw-bold text-primary"><i class="fas fa-shopping-basket"></i> Bahan-bahan</h5>
                    </div>
                    <div class="card-body">
                        ${ingredientsHtml}
                    </div>
                </div>
            </div>

            <div class="col-md-7">
                <div class="card border-0 shadow-sm rounded-4 h-100">
                    <div class="card-header bg-white border-0 pt-4 px-4">
                        <h4 class="fw-bold text-primary"><i class="fas fa-fire"></i> Cara Memasak</h4>
                    </div>
                    <div class="card-body px-4 pb-5">
                        <p class="card-text text-secondary" style="line-height: 1.8; font-size: 1.05rem;">
                            ${instructions}
                        </p>
                    </div>
                </div>
            </div>
        `;

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="alert alert-danger">Gagal memuat resep. Coba lagi nanti.</div>`;
    }
}

// ==========================================
// 4. FAVORITES PAGE (favorites.html)
// ==========================================

async function addToFav(idMeal, strMeal, strThumb) {
    try {
        const res = await fetch(`${API_URL}/favorites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ idMeal, strMeal, strThumb })
        });

        if (res.ok) alert('Berhasil disimpan ke Favorit!');
        else {
            const data = await res.json();
            alert(data.message || 'Gagal menyimpan');
        }
    } catch (err) { console.error(err); }
}

async function loadFavoritesPage() {
    const container = document.getElementById('favList');
    if (!container) return; // Stop kalau bukan di halaman favorit

    container.innerHTML = '<p class="text-center mt-5">Memuat data...</p>';

    try {
        const res = await fetch(`${API_URL}/favorites`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();

        container.innerHTML = '';

        if (data.length > 0) {
            data.forEach(fav => {
                container.innerHTML += `
                    <div class="col-md-3">
                        <div class="card h-100 shadow-sm border-0" style="border-radius: 15px; overflow: hidden;">
                            <img src="${fav.strThumb}" class="card-img-top" style="height: 200px; object-fit: cover;">
                            <div class="card-body">
                                <h6 class="card-title fw-bold text-dark">${fav.strMeal}</h6>
                                
                                <div class="d-flex gap-2 mt-3">
                                    <a href="detail.html?id=${fav.idMeal}&source=favorites" class="btn btn-sm btn-primary flex-fill" style="border-radius: 50px;">
                                    Lihat
                                    </a>
                                    
                                    <button onclick="removeFav('${fav.id}')" class="btn btn-sm btn-outline-danger" style="border-radius: 50px;">
                                    ❌
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            container.innerHTML = `
                <div class="col-12 text-center mt-5">
                    <h3 class="text-muted">💔</h3>
                    <p class="text-muted">Belum ada resep favorit.</p>
                    <a href="index.html" class="btn btn-primary btn-sm rounded-pill px-4">Cari Resep Dulu</a>
                </div>
            `;
        }
    } catch (err) { console.error(err); }
}

async function removeFav(id) {
    // 1. Konfirmasi dulu biar gak kepencet
    if (!confirm("Yakin ingin menghapus resep ini dari favorit?")) return;

    try {
        const res = await fetch(`${API_URL}/favorites/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await res.json();

        if (res.ok) {
            // 2. Jika sukses, reload halaman otomatis biar itemnya hilang
            loadFavoritesPage();
            // alert("Berhasil dihapus!"); // Opsional, kalau mau pake alert
        } else {
            alert(data.error || "Gagal menghapus");
        }
    } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan koneksi");
    }
}

// ==========================================
// 5. ADMIN PANEL (admin.html)
// ==========================================

// Cari Resep di API Luar untuk di-Import
async function adminSearch() {
    const query = document.getElementById('adminSearchInput').value;
    const div = document.getElementById('adminSearchResults');

    if (!query) return alert("Masukkan kata kunci!");

    // Tampilkan loading yang lebih menarik
    div.innerHTML = `
        <div class="col-12">
            <div class="loading-spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span class="ms-2">Sedang mencari resep...</span>
            </div>
        </div>
    `;

    try {
        const res = await fetch(`${API_URL}/recipes/search?q=${query}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();

        div.innerHTML = '';
        if (data.meals) {
            data.meals.forEach(meal => {
                div.innerHTML += `
                    <div class="col-12">
                        <div class="search-result-item">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="d-flex align-items-center">
                                    <img src="${meal.strMealThumb}" width="50" height="50" class="rounded me-3">
                                    <div>
                                        <strong class="d-block">${meal.strMeal}</strong>
                                        <small class="text-muted">${meal.strCategory || 'Unknown Category'}</small>
                                    </div>
                                </div>
                                <button class="btn btn-primary btn-sm" onclick="importMenu('${meal.idMeal}')">
                                    <i class="fas fa-download me-1"></i> Import
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            div.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Resep "<strong>${query}</strong>" tidak ditemukan.</p>
                    <small class="text-muted">Coba kata kunci lain dalam bahasa Inggris</small>
                </div>
            `;
        }
    } catch (err) {
        console.error(err);
        div.innerHTML = `
            <div class="col-12 text-center py-4">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <p class="text-danger">Terjadi kesalahan saat mencari resep</p>
            </div>
        `;
    }
}

// Import Menu ke Database Lokal
async function importMenu(idMeal) {
    try {
        const res = await fetch(`${API_URL}/admin/recipes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ idMeal })
        });

        if (res.ok) {
            alert('Menu berhasil diimport!');
            loadLocalMenus(); // Refresh tabel lokal
            document.getElementById('adminSearchResults').innerHTML = ''; // Clear search
        } else {
            const data = await res.json();
            alert(data.message || 'Gagal import');
        }
    } catch (err) { console.error(err); }
}

// Load Daftar Menu Lokal
async function loadLocalMenus() {
    const tbody = document.getElementById('currentMenuTable');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/recipes/recommendations`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();

        tbody.innerHTML = '';
        data.forEach(menu => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="${menu.strThumb}" width="50" class="rounded"></td>
                    <td>${menu.strMeal}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteMenu(${menu.id})">Hapus</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) { console.error(err); }
}

// Hapus Menu Lokal
async function deleteMenu(id) {
    if (!confirm("Yakin hapus menu ini dari rekomendasi?")) return;
    try {
        const res = await fetch(`${API_URL}/admin/recipes/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) loadLocalMenus();
    } catch (err) { console.error(err); }
}

// Load Semua User
async function loadAllUsers() {
    const tbody = document.getElementById('userList');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const users = await res.json();

        tbody.innerHTML = '';
        users.forEach(u => {
            const isMe = u.username === 'admin';
            const avatarLetter = u.username.charAt(0).toUpperCase();
            tbody.innerHTML += `
                <tr>
                    <td>
                        <div class="user-avatar">${avatarLetter}</div>
                    </td>
                    <td>
                        <strong>${u.username}</strong>
                    </td>
                    <td>
                        <span class="badge bg-${u.role === 'admin' ? 'danger' : 'secondary'}">
                            <i class="fas fa-${u.role === 'admin' ? 'crown' : 'user'} me-1"></i>
                            ${u.role}
                        </span>
                    </td>
                    <td>
                        <div class="api-key-display" title="${u.apiKey || 'No API Key'}">
                            ${u.apiKey || '-'}
                        </div>
                    </td>
                    <td>
                        ${u.role !== 'admin' ?
                    `<button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${u.id})" title="Hapus User">
                                <i class="fas fa-trash"></i>
                            </button>` :
                    `<span class="text-muted" title="Admin tidak bisa dihapus">
                                <i class="fas fa-shield-alt"></i>
                            </span>`
                }
                    </td>
                </tr>`;
        });
    } catch (err) { console.error(err); }
}

// Hapus User
async function deleteUser(id) {
    if (!confirm("Hapus user ini?")) return;
    try {
        const res = await fetch(`${API_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) loadAllUsers();
    } catch (err) { console.error(err); }
}

// ==========================================
// 6. API KEY MANAGEMENT (DASHBOARD)
// ==========================================

// Tampilkan API Key saat halaman dimuat
function loadUserApiKey() {
    const keyField = document.getElementById('userApiKey');
    const storedKey = localStorage.getItem('apiKey');

    if (keyField && storedKey) {
        keyField.value = storedKey;
    }
}

// Fitur Generate Baru
async function regenerateKey() {
    if (!confirm("Yakin ingin generate API Key baru? Key lama tidak akan bisa dipakai lagi.")) return;

    try {
        const res = await fetch(`${API_URL}/auth/regenerate-key`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('apiKey', data.newApiKey); // Update storage
            document.getElementById('userApiKey').value = data.newApiKey; // Update tampilan
            alert("API Key baru berhasil dibuat!");
        } else {
            alert("Gagal: " + data.error);
        }
    } catch (err) { console.error(err); }
}

// Fitur Copy ke Clipboard
function copyKey() {
    const copyText = document.getElementById("userApiKey");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    alert("API Key disalin!");
}

// Panggil fungsi ini saat load page (tambahkan di index.html script tag atau disini)
// Pastikan dipanggil kalau elemennya ada
if (document.getElementById('userApiKey')) {
    loadUserApiKey();
}

// ==========================================
// 7. API KEY RECOVERY
// ==========================================

// Fungsi untuk recovery API Key yang lupa
async function recoverApiKey() {
    const username = document.getElementById('forgotUsername').value;
    const password = document.getElementById('forgotPassword').value;
    const showCheck = document.getElementById('showApiKeyCheck').checked;

    // Reset previous results
    document.getElementById('recoveredApiKey').classList.add('d-none');
    document.getElementById('recoverError').classList.add('d-none');

    if (!username || !password) {
        showError('Mohon isi username dan password');
        return;
    }

    try {
        // Show loading
        const recoverBtn = event.target;
        const originalText = recoverBtn.innerHTML;
        recoverBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Mencari...';
        recoverBtn.disabled = true;

        const res = await fetch(`${API_URL}/auth/recover-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok && data.apiKey) {
            // Success - show API key
            const apiKeyDisplay = document.getElementById('apiKeyValue');
            apiKeyDisplay.textContent = data.apiKey;

            if (showCheck) {
                apiKeyDisplay.style.filter = 'none';
            } else {
                // Mask the API key for security
                const masked = data.apiKey.substring(0, 8) + '...' + data.apiKey.substring(data.apiKey.length - 4);
                apiKeyDisplay.textContent = masked;
                apiKeyDisplay.title = 'Centang "Tampilkan API Key" untuk melihat lengkap';
            }

            document.getElementById('recoveredApiKey').classList.remove('d-none');

            // Auto-fill login form if user wants
            setTimeout(() => {
                if (confirm('API Key ditemukan! Apakah ingin mengisi form login secara otomatis?')) {
                    document.getElementById('username').value = username;
                    document.getElementById('password').value = password;
                    document.getElementById('loginApiKey').value = data.apiKey;

                    // Close modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('forgotApiKeyModal'));
                    modal.hide();
                }
            }, 1000);

        } else {
            showError(data.error || 'Username atau password salah');
        }

    } catch (err) {
        console.error(err);
        showError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
        // Reset button
        recoverBtn.innerHTML = originalText;
        recoverBtn.disabled = false;
    }
}

// Fungsi untuk menampilkan error
function showError(message) {
    const errorDiv = document.getElementById('recoverError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
}

// Fungsi untuk copy recovered API key
function copyRecoveredApiKey() {
    const apiKeyValue = document.getElementById('apiKeyValue').textContent;

    // Remove masking if exists
    const actualApiKey = apiKeyValue.includes('...') ?
        document.getElementById('apiKeyValue').title : apiKeyValue;

    navigator.clipboard.writeText(actualApiKey).then(() => {
        // Show success feedback
        const copyBtn = event.target;
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check me-1"></i>Tersalin!';
        copyBtn.classList.remove('btn-outline-success');
        copyBtn.classList.add('btn-success');

        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('btn-success');
            copyBtn.classList.add('btn-outline-success');
        }, 2000);
    }).catch(err => {
        console.error('Gagal menyalin:', err);
        alert('Gagal menyalin API Key. Silakan salin manual.');
    });
}

// Toggle API Key visibility
document.getElementById('showApiKeyCheck')?.addEventListener('change', function () {
    const apiKeyDisplay = document.getElementById('apiKeyValue');
    const currentText = apiKeyDisplay.textContent;

    if (this.checked && apiKeyDisplay.title) {
        // Show full API key
        apiKeyDisplay.textContent = apiKeyDisplay.title;
        apiKeyDisplay.style.filter = 'none';
    } else if (!this.checked && currentText.length > 12) {
        // Mask API key again
        const masked = currentText.substring(0, 8) + '...' + currentText.substring(currentText.length - 4);
        apiKeyDisplay.textContent = masked;
        apiKeyDisplay.title = currentText;
    }
});

// ==========================================
// 8. STATISTICS DASHBOARD (admin.html)
// ==========================================

// Load Statistik Dashboard
async function loadStatistics() {
    try {
        // Load Users untuk statistik
        const usersRes = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const users = await usersRes.json();

        // Load Menu untuk statistik
        const menuRes = await fetch(`${API_URL}/recipes/recommendations`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const menus = await menuRes.json();

        // Update statistik
        const totalUsers = users.length;
        const adminUsers = users.filter(u => u.role === 'admin').length;
        const activeKeys = users.filter(u => u.apiKey).length;
        const totalMenus = menus.length;

        // Update DOM dengan animasi
        animateValue('totalUsers', 0, totalUsers, 1000);
        animateValue('totalMenus', 0, totalMenus, 1000);
        animateValue('activeKeys', 0, activeKeys, 1000);
        animateValue('adminCount', 0, adminUsers, 1000);

    } catch (err) {
        console.error('Error loading statistics:', err);
    }
}

// Fungsi animasi angka
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (!element) return;

    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}