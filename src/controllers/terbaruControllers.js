const terbaruService = require("../services/terbaruService");

const getTerbaru = async (req, res) => {
  try {
    const data = await terbaruService.fetchTerbaruData();

    res.status(200).json({
      status: true,
      message: "Berhasil mengambil daftar komik terbaru",
      total: data.length,
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Gagal mengambil daftar komik terbaru",
      error: err.message,
    });
  }
};

module.exports = { getTerbaru };
