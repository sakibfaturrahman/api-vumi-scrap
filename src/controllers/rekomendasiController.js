const axios = require("axios");
const cheerio = require("cheerio");
const { SOURCES } = require("../utils/constants");
const { getHeaders } = require("../utils/headers");

/**
 * Service untuk mengambil daftar komik rekomendasi dari halaman utama
 */
const fetchRekomendasiData = async () => {
  try {
    const URL_KOMIKU = SOURCES.komiku || "https://komiku.org/";

    const { data } = await axios.get(URL_KOMIKU, {
      headers: getHeaders("komiku"),
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const rekomendasi = [];

    // Scraping section Rekomendasi Komik
    $("#Rekomendasi_Komik article.ls2").each((i, el) => {
      const anchorTag = $(el).find("a").first();
      const imgTag = $(el).find("img");

      // Pembersihan judul dari prefix "Baca Komik..."
      const title = (
        imgTag.attr("alt") ||
        anchorTag.attr("alt") ||
        $(el).find(".ls2j h3 a").text()
      )
        ?.replace(/^Baca (Komik|Manga|Manhwa|Manhua)\s+/i, "")
        .trim();

      const originalLinkPath = anchorTag.attr("href");
      const thumbnail = imgTag.attr("data-src") || imgTag.attr("src");

      // Ekstraksi slug untuk API Internal
      let slug = "";
      if (originalLinkPath) {
        const matches = originalLinkPath.match(/\/manga\/([^/]+)/);
        if (matches && matches[1]) {
          slug = matches[1];
        }
      }

      if (title && thumbnail) {
        rekomendasi.push({
          title,
          slug: slug,
          thumbnail,
          apiDetailLink: slug
            ? `/api/v1/manga/detail/${slug}`
            : originalLinkPath,
        });
      }
    });

    return rekomendasi;
  } catch (error) {
    throw new Error("Gagal mengambil komik rekomendasi: " + error.message);
  }
};

module.exports = { fetchRekomendasiData };
