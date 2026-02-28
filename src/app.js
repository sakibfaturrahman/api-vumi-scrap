const express = require("express");
const cors = require("cors");
const mangaRoutes = require("./routes/mangaRoutes");

const app = express();

// --- Middleware ---

/**
 * Konfigurasi CORS: Penting agar Flutter App (atau web)
 * bisa mengakses API ini tanpa diblokir browser/sistem keamanan.
 */
app.use(
  cors({
    origin: "*", // Di tahap development, kita izinkan semua.
    allowedHeaders: ["Content-Type", "Authorization", "x-source"], // Tambahkan 'x-source' ke daftar allowed headers
  }),
);

// Agar Express bisa menerima body request berformat JSON
app.use(express.json());

// Middleware Logging: Membantu memantau request di Vercel Dashboard
app.use((req, res, next) => {
  const source = req.headers["x-source"] || "shinigami";
  console.log(`[VUMI] ${req.method} ${req.url} | Source: ${source}`);
  next();
});

// --- Routes ---

// Root Endpoint: Untuk health check atau pengecekan manual via browser
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Vumi API is Online",
    version: "1.0.0",
    engine: "Express.js + Cheerio",
    available_sources: ["shinigami", "kiryuu"],
    endpoints: {
      latest: "/api/v1/manga/list",
      search: "/api/v1/manga/search?q=query",
      detail: "/api/v1/manga/detail/:slug",
      read: "/api/v1/manga/read/:slug/:chapter",
    },
  });
});

// Mapping route dengan prefix versi (Clean Code)
app.use("/api/v1/manga", mangaRoutes);

// --- Error Handling ---

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: `Oops! Endpoint '${req.originalUrl}' tidak ditemukan.`,
  });
});

// Global Error Handler: Mencegah server crash total jika ada error tak terduga
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: false,
    message: "Terjadi kesalahan internal pada server!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

module.exports = app;
