const pustakaService = require("../services/pustakaService");

const pustakaController = {
  /**
   * Mengambil data pustaka halaman pertama
   */
  getPustakaPage: async (req, res) => {
    try {
      const data = await pustakaService.scrapePustakaData(1);
      res.json({
        status: true,
        message: "Success fetch pustaka page 1",
        data: data,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  },

  /**
   * Mengambil data pustaka dengan nomor halaman spesifik
   */
  getPustakaPagination: async (req, res) => {
    try {
      const page = parseInt(req.params.page) || 1;

      if (page < 1) {
        return res
          .status(400)
          .json({ status: false, message: "Halaman harus lebih dari 0" });
      }

      const data = await pustakaService.scrapePustakaData(page);
      res.json({
        status: true,
        message: `Success fetch pustaka page ${page}`,
        data: data,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  },
};

module.exports = pustakaController;
