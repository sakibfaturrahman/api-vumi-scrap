const detailKomikService = require("../services/detailKomikService");
const { SOURCES } = require("../utils/constants");

const getDetail = async (req, res) => {
  try {
    const { slug } = req.params;

    // Mengambil Base URL dan memastikan ada trailing slash agar tidak terjadi 'komiku.orgmanhwa'
    let URL_BASE = SOURCES.komiku || "https://komiku.org/";
    if (!URL_BASE.endsWith("/")) {
      URL_BASE += "/";
    }

    // Mengganti 'manga' menjadi 'manhwa' sesuai permintaanmu
    const komikUrl = `${URL_BASE}manga/${slug}/`;

    // Debugging untuk memastikan URL di server Vercel sudah benar
    console.log(`[DEBUG] Scraping detail to: ${komikUrl}`);

    const komikDetail = await detailKomikService.scrapeKomikDetail(komikUrl);

    res.json({
      status: true,
      message: "Success fetch komik detail",
      data: komikDetail,
    });
  } catch (err) {
    // Memberikan response error 500 jika scraping gagal atau URL tidak ditemukan
    res.status(500).json({
      status: false,
      message: "Gagal mengambil detail komik",
      error: err.message,
    });
  }
};

const getDetailByUrl = async (req, res) => {
  try {
    const { url } = req.query;

    // Validasi URL agar hanya menerima dari domain komiku
    if (!url || (!url.includes("komiku.id/") && !url.includes("komiku.org/"))) {
      return res.status(400).json({
        status: false,
        message: "URL tidak valid, harus berasal dari domain Komiku",
      });
    }

    const komikDetail = await detailKomikService.scrapeKomikDetail(url);
    res.json({
      status: true,
      data: komikDetail,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Gagal mengambil detail via URL",
      error: err.message,
    });
  }
};

module.exports = { getDetail, getDetailByUrl };
