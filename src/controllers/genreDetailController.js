const genreDetailService = require("../services/genreDetailService");

const genreDetailController = {
  /**
   * Handler utama untuk list manga per genre
   */
  getMangaByGenre: async (req, res) => {
    try {
      const { slug } = req.params;
      const page = req.params.page || req.query.page || 1;

      // Validasi nomor halaman
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          status: false,
          message: "Nomor halaman harus berupa angka positif",
        });
      }

      const result = await genreDetailService.fetchMangaByGenre(slug, pageNum);

      if (result.totalManga === 0) {
        return res.status(404).json({
          status: false,
          message: `Tidak ada komik ditemukan untuk genre "${slug}" pada halaman ${pageNum}`,
        });
      }

      res.status(200).json({
        status: true,
        message: `Berhasil mengambil daftar komik genre ${slug}`,
        ...result,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil data genre detail",
        error: err.message,
      });
    }
  },
};

module.exports = genreDetailController;
