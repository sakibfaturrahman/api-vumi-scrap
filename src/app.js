const express = require("express");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const path = require("path");

// Load JSON Documentation
const swaggerDocument = require(path.join(__dirname, "./utils/swagger.json"));

// Import Middleware
const rateLimiter = require("../middleware/rateLimiter");

// Penanganan error global agar server tidak mati total di Vercel
process.on("uncaughtException", (err) => {
  console.error("Ada error yang tidak tertangkap:", err);
});

const app = express();
const port = process.env.PORT || 3001;

// Standard Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// --- Konfigurasi Asset Swagger ---
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";
const swaggerOptions = {
  customCssUrl: CSS_URL,
  customJs: [
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
  ],
  customSiteTitle: "VUMI API Docs",
};

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, swaggerOptions),
);

// --- Import Routes ---
const terbaruRoute = require("./routes/terbaru");
const detailKomikRoute = require("./routes/detail-komik");
const bacaChapterRoute = require("./routes/baca-chapter");
const searchRoute = require("./routes/search");
const berwarnaRoute = require("./routes/berwarna");
const pustakaRouter = require("./routes/pustaka");
const komikPopulerRoute = require("./routes/komik-populer");
const rekomendasiRoute = require("./routes/rekomendasi");
const genreAll = require("./routes/genre-all");
const genreDetail = require("./routes/genre-detail");
const genreRekomendasi = require("./routes/genre-rekomendasi");

// --- Prefix Global ---
const prefix = "/api/vumi";

// --- Register Routes ---
app.use(`${prefix}/terbaru`, terbaruRoute);
app.use(`${prefix}/detail-komik`, detailKomikRoute);
app.use(`${prefix}/baca-chapter`, bacaChapterRoute);
app.use(`${prefix}/search`, searchRoute);
app.use(`${prefix}/berwarna`, berwarnaRoute);
app.use(`${prefix}/pustaka`, pustakaRouter);
app.use(`${prefix}/komik-populer`, komikPopulerRoute);
app.use(`${prefix}/rekomendasi`, rekomendasiRoute);
app.use(`${prefix}/genre-all`, genreAll);
app.use(`${prefix}/genre-rekomendasi`, genreRekomendasi);
app.use(`${prefix}/genre`, genreDetail);

// --- PENYESUAIAN PENTING: Backward Compatibility ---
// Karena di Controller ada redirect ke /api/v1/manga/read (jika belum diubah),
// atau jika ada aplikasi lama yang memanggil prefix v1, kita arahkan ke prefix vumi yang baru.
app.get("/api/v1/manga/read/:slug/:chapter", (req, res) => {
  const { slug, chapter } = req.params;
  res.redirect(`${prefix}/baca-chapter/${slug}/${chapter}`);
});

// Root route
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Welcome to VUMI (ComicVerse) Rest API",
    version: "1.0.0",
    docs: "/api-docs",
    endpoint_prefix: prefix,
    author: "Kibbz Skibidi - Informatics Student",
  });
});

// Menjalankan Server
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app;
