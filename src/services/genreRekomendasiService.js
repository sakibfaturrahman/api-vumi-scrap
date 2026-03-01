const axios = require("axios");
const cheerio = require("cheerio");
const { SOURCES } = require("../utils/constants");
const { getHeaders } = require("../utils/headers");

/**
 * Service untuk mengambil daftar genre rekomendasi (biasanya dengan thumbnail)
 */
const fetchGenreRekomendasi = async () => {
  try {
    const URL_KOMIKU = SOURCES.komiku || "https://komiku.org/";

    const { data } = await axios.get(URL_KOMIKU, {
      headers: getHeaders("komiku"),
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const results = [];

    // Scraping elemen .ls3 (biasanya berisi genre pilihan/rekomendasi)
    $(".ls3").each((i, el) => {
      const anchorTag = $(el).find("a").first();
      const imgTag = $(el).find("img");
      const title = $(el).find(".ls3p h4").text().trim();
      const originalLinkPath = anchorTag.attr("href");

      let thumbnail = imgTag.attr("src") || imgTag.attr("data-src");

      // Ekstraksi slug genre atau status (berwarna/end)
      let genreSlug = "";
      if (originalLinkPath) {
        const matches =
          originalLinkPath.match(/\/genre\/([^/]+)/) ||
          originalLinkPath.match(/\/(other|statusmanga)\/([^/]+)/);
        genreSlug = matches ? matches[2] || matches[1] : "";
      }

      if (title && thumbnail) {
        results.push({
          title,
          slug: genreSlug,
          thumbnail,
          apiGenreLink: genreSlug
            ? `/api/v1/manga/genre/${genreSlug}`
            : originalLinkPath,
        });
      }
    });

    return results;
  } catch (error) {
    throw new Error("Gagal mengambil genre rekomendasi: " + error.message);
  }
};

module.exports = { fetchGenreRekomendasi };
