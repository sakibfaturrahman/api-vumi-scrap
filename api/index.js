const app = require("../src/app");

// Cek apakah sedang berjalan di lokal atau di Vercel
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`[VUMI] Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
