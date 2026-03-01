const populerService = require("../services/komikPopulerService");

const komikPopulerController = {
  // Semua populer
  getAllPopuler: async (req, res) => {
    try {
      const data = await populerService.fetchAllPopuler();
      res.json({ status: true, data });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  },

  // Manga Populer
  getMangaPopuler: async (req, res) => {
    try {
      const data =
        await populerService.fetchPopulerBySection("#Komik_Hot_Manga");
      res.json({ status: true, data });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  },

  // Manhwa Populer
  getManhwaPopuler: async (req, res) => {
    try {
      const data =
        await populerService.fetchPopulerBySection("#Komik_Hot_Manhwa");
      res.json({ status: true, data });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  },

  // Manhua Populer
  getManhuaPopuler: async (req, res) => {
    try {
      const data =
        await populerService.fetchPopulerBySection("#Komik_Hot_Manhua");
      res.json({ status: true, data });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  },
};

module.exports = komikPopulerController;
