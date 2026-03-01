const searchService = require("../services/searchService");

const getSearch = async (req, res) => {
  try {
    const keyword = req.query.q;
    if (!keyword) {
      return res
        .status(400)
        .json({ status: false, message: "Parameter q wajib diisi" });
    }

    const result = await searchService.searchManga(keyword);

    res.status(200).json({
      status: true,
      message:
        result.total > 0
          ? "Berhasil mendapatkan hasil pencarian"
          : "Tidak ada hasil ditemukan",
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Gagal melakukan pencarian",
      error: error.message,
    });
  }
};

module.exports = { getSearch };
