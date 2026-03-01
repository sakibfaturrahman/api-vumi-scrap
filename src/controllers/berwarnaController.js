const berwarnaService = require("../services/berwarnaService");

const berwarnaController = {
  /**
   * Mengambil daftar berwarna (Default Page 1)
   */
  getBerwarnaList: async (req, res) => {
    try {
      const data = await berwarnaService.scrapeBerwarnaData(1);
      res.json({
        status: true,
        message: "Success fetch berwarna list",
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil data komik berwarna",
        error: error.message,
      });
    }
  },

  /**
   * Mengambil daftar berwarna berdasarkan nomor halaman
   */
  getBerwarnaByPage: async (req, res) => {
    try {
      const { page } = req.params;
      const pageNum = parseInt(page);

      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          status: false,
          message: "Parameter halaman harus berupa angka positif",
        });
      }

      const data = await berwarnaService.scrapeBerwarnaData(pageNum);
      res.json({
        status: true,
        message: `Success fetch berwarna page ${pageNum}`,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil data halaman berwarna",
        error: error.message,
      });
    }
  },
};

module.exports = berwarnaController;
