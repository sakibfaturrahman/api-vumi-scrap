const axios = require("axios");
const cheerio = require("cheerio");
const { SOURCES } = require("../utils/constants");
const { getHeaders } = require("../utils/headers");

/**
 * Fungsi untuk mengambil semua daftar genre dari halaman utama
 */
const fetchAllGenres = async () => {
  try {
    const URL_KOMIKU = SOURCES.komiku || "https://komiku.org/";

    const { data } = await axios.get(URL_KOMIKU, {
      headers: getHeaders("komiku"),
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const allGenres = [];

    // Scraping semua genre dari elemen ul.genre
    $("ul.genre li").each((i, el) => {
      const anchorTag = $(el).find("a");
      const title = anchorTag.text().trim();
      const originalLinkPath = anchorTag.attr("href");
      const titleAttr = anchorTag.attr("title");

      // Ekstraksi slug genre dari URL path
      let genreSlug = "";
      if (originalLinkPath) {
        const matches = originalLinkPath.match(/\/genre\/([^/]+)/);
        if (matches && matches[1]) {
          genreSlug = matches[1];
        }
      }

      // Format link API untuk digunakan di Flutter
      const apiGenreLink = genreSlug
        ? `/api/v1/manga/genre/${genreSlug}`
        : originalLinkPath;

      if (title && originalLinkPath) {
        allGenres.push({
          title,
          slug: genreSlug,
          apiGenreLink,
          titleAttr: titleAttr || title,
        });
      }
    });

    return allGenres;
  } catch (error) {
    throw new Error(
      "Service Error: Gagal mengambil daftar genre. " + error.message,
    );
  }
};

module.exports = { fetchAllGenres };
