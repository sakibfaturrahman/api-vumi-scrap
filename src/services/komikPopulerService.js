const axios = require("axios");
const cheerio = require("cheerio");
const { SOURCES } = require("../utils/constants");
const { getHeaders } = require("../utils/headers");

const URL_KOMIKU = SOURCES.komiku || "https://komiku.org/";

/**
 * Helper internal untuk scraping per bagian (Hot Manga/Manhwa/Manhua)
 */
function scrapeSection($, sectionSelector) {
  const sectionElement = $(sectionSelector);
  const resultItems = [];
  const sectionTitle = sectionElement.find("h2.lsh3").text().trim();

  sectionElement.find("article.ls2").each((i, el) => {
    const articleElement = $(el);
    const linkElement = articleElement.find(".ls2v > a").first();
    const imgElement = linkElement.find("img");
    const detailElement = articleElement.find(".ls2j");

    // Ekstraksi Judul & Thumbnail
    let title = imgElement
      .attr("alt")
      ?.replace(/^Baca (Manga|Manhwa|Manhua|Komik)\s+/i, "")
      .trim();
    if (!title) title = detailElement.find("h3 a").text().trim();

    const originalLinkPath = linkElement.attr("href");
    const thumbnail = imgElement.attr("data-src") || imgElement.attr("src");

    // Ekstraksi Slug & Chapter Number
    let mangaSlug = originalLinkPath?.match(/\/manga\/([^/]+)/)?.[1] || "";
    const latestChapterElement = detailElement.find("a.ls2l");
    const chapterLinkPath = latestChapterElement.attr("href") || "";
    let chapterNumber = chapterLinkPath.match(/-chapter-([\d.]+)/)?.[1] || "";

    if (title && thumbnail) {
      resultItems.push({
        title,
        mangaSlug,
        thumbnail,
        genre: detailElement.find(".ls2t").text().trim().split(" ")[0],
        latestChapter: latestChapterElement.text().trim(),
        chapterNumber,
        apiDetailLink: mangaSlug ? `/api/v1/manga/detail/${mangaSlug}` : null,
        apiChapterLink:
          mangaSlug && chapterNumber
            ? `/api/v1/manga/read/${mangaSlug}/${chapterNumber}`
            : null,
      });
    }
  });

  return { title: sectionTitle, items: resultItems };
}

/**
 * Service untuk mengambil semua kategori populer sekaligus
 */
const fetchAllPopuler = async () => {
  const { data } = await axios.get(URL_KOMIKU, {
    headers: getHeaders("komiku"),
  });
  const $ = cheerio.load(data);

  return {
    manga: scrapeSection($, "#Komik_Hot_Manga"),
    manhwa: scrapeSection($, "#Komik_Hot_Manhwa"),
    manhua: scrapeSection($, "#Komik_Hot_Manhua"),
  };
};

/**
 * Service untuk mengambil kategori populer spesifik
 */
const fetchPopulerBySection = async (sectionId) => {
  const { data } = await axios.get(URL_KOMIKU, {
    headers: getHeaders("komiku"),
  });
  const $ = cheerio.load(data);
  return scrapeSection($, sectionId);
};

module.exports = { fetchAllPopuler, fetchPopulerBySection };
