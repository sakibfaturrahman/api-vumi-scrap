const express = require("express");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const path = require("path");

// 1. Load JSON Documentation secara langsung (Gantikan JSDoc yang bermasalah)
const swaggerDocument = require("./utils/swagger.json");

// Import Middleware
const rateLimiter = require("../middleware/rateLimiter");

// Penanganan error global
process.on("uncaughtException", (err) => {
  console.error("Ada error yang tidak tertangkap:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const app = express();
const port = process.env.PORT || 3001;

// Standard Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// 2. Setup Swagger UI menggunakan file JSON
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

// --- Implementasi Routes dengan Prefix ---
const prefix = "/api/v1";

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

// Root route
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Welcome to VUMI (Mangaverse) Rest API",
    version: "1.0.0",
    docs: "/api-docs",
    endpoint_prefix: prefix,
    author: "Sakib - Informatics Student",
  });
});

// Menjalankan Server (Hanya jika tidak di Vercel)
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Documentation available at http://localhost:${port}/api-docs`);
  });
}

module.exports = app;
