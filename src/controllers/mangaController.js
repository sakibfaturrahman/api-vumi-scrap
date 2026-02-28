const mangaService = require("../services/mangaService");
const detailService = require("../services/detailService");
const chapterService = require("../services/chapterService");
const searchService = require("../services/searchService");

const getLatest = async (req, res) => {
  try {
    // Menentukan sumber (default: shinigami)
    const source = req.headers["x-source"] || "shinigami";
    const { type, page } = req.query;

    const data = await mangaService.fetchMangaByType(
      source,
      type || "manga",
      page || 1,
    );

    res.status(200).json({
      status: true,
      message: `Success fetch latest from ${source}`,
      data,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const getDetail = async (req, res) => {
  try {
    const source = req.headers["x-source"] || "shinigami";
    const { endpoint } = req.params;

    // Pastikan service detail juga menerima parameter 'source'
    const data = await detailService.fetchMangaDetail(source, endpoint);

    res.status(200).json({
      status: true,
      message: `Success fetch detail from ${source}`,
      data,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const getChapterImages = async (req, res) => {
  try {
    const source = req.headers["x-source"] || "shinigami";
    const { endpoint, chapter } = req.params;

    // Mengambil gambar berdasarkan sumber yang dipilih
    const data = await chapterService.fetchChapterImages(
      source,
      endpoint,
      chapter,
    );

    res.status(200).json({
      status: true,
      message: `Success fetch images from ${source}`,
      data,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const search = async (req, res) => {
  try {
    const source = req.headers["x-source"] || "shinigami";
    const { q } = req.query;

    const data = await searchService.searchManga(source, q);

    res.status(200).json({
      status: true,
      message: `Search results from ${source}`,
      data,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = { getLatest, getDetail, getChapterImages, search };
