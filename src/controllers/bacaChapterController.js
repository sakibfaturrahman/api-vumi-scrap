const bacaChapterService = require("../services/bacaChapterService");

const getBacaChapter = async (req, res) => {
  try {
    const { slug, chapter } = req.params;

    // Memanggil logika dari service
    const data = await bacaChapterService.fetchChapterData(slug, chapter);

    res.json({
      status: true,
      message: "Success fetch chapter images",
      data: data,
    });
  } catch (err) {
    console.error("Error in getBacaChapter Controller:", err.message);
    res.status(500).json({
      status: false,
      message: "Gagal mengambil data chapter komik",
      error: err.message,
    });
  }
};

const getChapterByUrl = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || !url.includes("chapter")) {
      return res
        .status(400)
        .json({ status: false, message: "URL tidak valid" });
    }

    const { slug, chapter } = bacaChapterService.extractSlugAndChapter(url);

    if (!slug || !chapter) {
      return res
        .status(400)
        .json({ status: false, message: "Gagal mengekstrak data dari URL" });
    }

    // Redirect menggunakan path API yang konsisten
    return res.redirect(`/api/v1/manga/read/${slug}/${chapter}`);
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
};

module.exports = {
  getBacaChapter,
  getChapterByUrl,
};
