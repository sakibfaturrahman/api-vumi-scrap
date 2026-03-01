const genreRekomendasiService = require("../services/genreRekomendasiService");

const getGenreRekomendasi = async (req, res) => {
  try {
    const data = await genreRekomendasiService.fetchGenreRekomendasi();

    res.status(200).json({
      status: true,
      message: "Berhasil mengambil genre rekomendasi",
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Gagal mengambil genre rekomendasi dari server.",
      error: err.message,
    });
  }
};

module.exports = { getGenreRekomendasi };
