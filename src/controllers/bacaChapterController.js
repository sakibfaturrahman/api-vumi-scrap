const bacaChapterService = require("../services/bacaChapterService");

/**
 * Mendapatkan daftar gambar chapter berdasarkan slug dan nomor chapter
 * Endpoint: /api/vumi/baca-chapter/:slug/:chapter
 */
const getBacaChapter = async (req, res) => {
  try {
    const { slug, chapter } = req.params;

    // Bersihkan nomor chapter dari leading zeros (misal '01' -> '1', tapi '10' tetap '10')
    const cleanChapter =
      chapter.length > 1 ? chapter.replace(/^0+/, "") : chapter;

    // Memanggil logika dari service yang sudah diperbaiki
    const data = await bacaChapterService.fetchChapterData(slug, cleanChapter);

    // Validasi jika data gambar kosong
    if (!data.images || data.images.length === 0) {
      return res.status(404).json({
        status: false,
        message:
          "Gambar tidak ditemukan. Komik ini mungkin memerlukan akses login di sumber aslinya.",
      });
    }

    res.json({
      status: true,
      message: "Success fetch chapter images",
      data: data,
    });
  } catch (err) {
    console.error(
      `[CONTROLLER ERROR] Slug: ${req.params.slug}, Chap: ${req.params.chapter} -> ${err.message}`,
    );
    res.status(500).json({
      status: false,
      message: "Gagal mengambil data chapter komik",
      error: err.message,
    });
  }
};

/**
 * Mendapatkan data chapter berdasarkan URL lengkap Komiku
 * Digunakan untuk integrasi navigasi dari link asli
 */
const getChapterByUrl = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || !url.includes("chapter")) {
      return res.status(400).json({
        status: false,
        message: "URL tidak valid atau bukan merupakan link chapter",
      });
    }

    const { slug, chapter } = bacaChapterService.extractSlugAndChapter(url);

    if (!slug || !chapter) {
      return res.status(400).json({
        status: false,
        message: "Gagal mengekstrak slug atau chapter dari URL yang diberikan",
      });
    }

    // Redirect menggunakan path API VUMI yang konsisten
    // Menyesuaikan dari /api/v1/manga/read menjadi /api/vumi/baca-chapter
    return res.redirect(`/api/vumi/baca-chapter/${slug}/${chapter}`);
  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message,
    });
  }
};

module.exports = {
  getBacaChapter,
  getChapterByUrl,
};
