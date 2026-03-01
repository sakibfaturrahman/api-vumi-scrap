const detailKomikService = require("../services/detailKomikService");
const { SOURCES } = require("../utils/constants");

const getDetail = async (req, res) => {
  try {
    const { slug } = req.params;
    const URL_BASE = SOURCES.komiku || "https://komiku.org/";
    const komikUrl = `${URL_BASE}manga/${slug}/`;

    const komikDetail = await detailKomikService.scrapeKomikDetail(komikUrl);
    res.json({
      status: true,
      message: "Success fetch komik detail",
      data: komikDetail,
    });
  } catch (err) {
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

    if (
      !url ||
      (!url.includes("komiku.id/manga/") && !url.includes("komiku.org/manga/"))
    ) {
      return res.status(400).json({
        status: false,
        message: "URL tidak valid, harus dari komiku/manga/",
      });
    }

    const komikDetail = await detailKomikService.scrapeKomikDetail(url);
    res.json({
      status: true,
      data: komikDetail,
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

module.exports = { getDetail, getDetailByUrl };
