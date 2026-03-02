const axios = require("axios");
const cheerio = require("cheerio");
const { SOURCES } = require("../utils/constants");
const { getHeaders } = require("../utils/headers");

/**
 * Service untuk mengambil daftar komik yang baru saja update
 */
const fetchTerbaruData = async () => {
  const URL_KOMIKU = SOURCES.komiku || "https://komiku.org/";
  
  const { data } = await axios.get(URL_KOMIKU, {
    headers: getHeaders('komiku'),
    timeout: 10000,
  });

  const $ = cheerio.load(data);
  const komikTerbaru = [];

  $("#Terbaru div.ls4w article.ls4").each((i, el) => {
    const element = $(el);
    const linkElement = element.find(".ls4v > a").first();
    const imgElement = linkElement.find("img");
    const detailElement = element.find(".ls4j");

    // Ekstraksi Judul
    const title = detailElement.find("h3 > a").text().trim() || 
                  imgElement.attr("alt")?.replace(/^Baca (Manga|Manhwa|Manhua)\s+/i, "").trim();

    const originalLinkPath = linkElement.attr("href");
    const thumbnail = imgElement.attr("data-src") || imgElement.attr("src");

    // Parsing Type, Genre, dan Waktu
    const typeGenreTimeString = detailElement.find("span.ls4s").text().trim();
    let type = "Unknown", genre = "Unknown", updateTime = "Unknown";
    const typeMatch = typeGenreTimeString.match(/^(Manga|Manhwa|Manhua)/i);
    
    if (typeMatch) {
      type = typeMatch[0];
      const rest = typeGenreTimeString.substring(type.length).trim();
      const timeMatch = rest.match(/(.+?)\s+([\d\w\s]+lalu)$/i);
      genre = timeMatch ? timeMatch[1].trim() : rest;
      updateTime = timeMatch ? timeMatch[2].trim() : "Unknown";
    }

    // Ekstraksi Slug & Chapter Terakhir
    const latestChapterElement = detailElement.find("a.ls24");
    const latestChapterPath = latestChapterElement.attr("href") || "";
    let mangaSlug = originalLinkPath?.match(/\/manga\/([^/]+)/)?.[1] || "";
    let chapterNum = latestChapterPath.match(/-chapter-([\d.]+)/)?.[1] || 
                     latestChapterPath.match(/\/([\d.]+)\/?$/)?.[1] || "";

    if (title && thumbnail && originalLinkPath) {
      komikTerbaru.push({
        title,
        mangaSlug,
        thumbnail,
        type,
        genre,
        updateTime,
        latestChapterTitle: latestChapterElement.text().trim(),
        isColored: element.find(".ls4v span.warna").length > 0,
        updateCount: element.find(".ls4v span.up").text().trim(),
        apiDetailLink: mangaSlug ? `/api/v1/manga/detail/${mangaSlug}` : null,
        apiChapterLink: (mangaSlug && chapterNum) ? `/api/v1/manga/read/${mangaSlug}/${chapterNum}` : null
      });
    }
  });

  return komikTerbaru;
};

module.exports = { fetchTerbaruData };