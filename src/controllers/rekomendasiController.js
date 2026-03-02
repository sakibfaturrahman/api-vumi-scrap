const rekomendasiService = require("../services/rekomendasiService");

const rekomendasiController = {
  getRekomendasi: async (req, res) => {
    try {
      const data = await rekomendasiService.fetchRekomendasiData();

      res.status(200).json({
        status: true,
        message: "Berhasil mengambil data rekomendasi komik",
        data: data,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil komik rekomendasi dari server.",
        error: err.message,
      });
    }
  },
};

module.exports = rekomendasiController;
