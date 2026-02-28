const express = require("express");
const router = express.Router();
const mangaController = require("../controllers/mangaController");

/**
 * @route   GET /api/manga/list
 * @desc    Ambil daftar komik terbaru (Manga/Manhwa/Manhua)
 * @params  query: type (manga|manhwa|manhua), page
 * @header  x-source: shinigami|kiryuu
 */
router.get("/list", mangaController.getLatest);

/**
 * @route   GET /api/manga/detail/:endpoint
 * @desc    Ambil detail komik dan daftar chapter
 * @header  x-source: shinigami|kiryuu
 */
router.get("/detail/:endpoint", mangaController.getDetail);

/**
 * @route   GET /api/manga/read/:endpoint/:chapter
 * @desc    Ambil daftar gambar per halaman chapter
 * @header  x-source: shinigami|kiryuu
 */
router.get("/read/:endpoint/:chapter", mangaController.getChapterImages);

/**
 * @route   GET /api/manga/search
 * @desc    Cari komik berdasarkan judul
 * @params  query: q (keyword)
 * @header  x-source: shinigami|kiryuu
 */
router.get("/search", mangaController.search);

module.exports = router;
