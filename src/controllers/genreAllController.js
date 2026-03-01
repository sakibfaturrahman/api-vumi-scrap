const genreService = require("../services/genreService");

const getGenreAll = async (req, res) => {
  try {
    // Memanggil logika scraping dari genreService
    const data = await genreService.fetchAllGenres();

    res.status(200).json({
      status: true,
      message: "Berhasil mengambil semua daftar genre",
      data: data,
    });
  } catch (err) {
    console.error("Kesalahan pada Genre Controller:", err.message);
    res.status(500).json({
      status: false,
      message: "Gagal mengambil semua genre dari server.",
      error: err.message,
    });
  }
};

module.exports = { getGenreAll };
