require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api'); 
const { exec } = require('child_process'); // 1. Tambahkan import ini

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Gunakan Routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Server is running on ${url}`);
});