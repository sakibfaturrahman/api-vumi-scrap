const axios = require("axios");
const cheerio = require("cheerio");
const { SOURCES } = require("../utils/constants");
const { getHeaders } = require("../utils/headers");

/**
 * Fungsi utama untuk scraping detail lengkap komik
 */
const scrapeKomikDetail = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: getHeaders("komiku"),
      timeout: 10000,
    });

    const $ = cheerio.load(data);

    // --- Ekstraksi Data Dasar ---
    const title = $("h1 span[itemprop='name']").text().trim();
    const alternativeTitle = $("p.j2").text().trim();
    const description = $("p.desc").text().trim();
    const sinopsis = $("section#Sinopsis p").text().trim();
    const thumbnail = $("section#Informasi div.ims img").attr("src");

    // --- Ekstraksi Tabel Informasi ---
    const infoTable = {};
    $("section#Informasi table.inftable tr").each((i, el) => {
      const key = $(el).find("td").first().text().trim();
      const value = $(el).find("td").last().text().trim();
      infoTable[key] = value;
    });

    const genres = [];
    $("section#Informasi ul.genre li").each((i, el) => {
      genres.push($(el).text().trim());
    });

    let komikSlug = "";
    const urlMatches = url.match(/\/manga\/([^/]+)/);
    if (urlMatches && urlMatches[1]) {
      komikSlug = urlMatches[1];
    }

    // --- Logika Helper Chapter (Awal & Terbaru) ---
    const extractChapterMeta = (selector) => {
      const link = $(`#Judul div.new1:contains('${selector}') a`).attr("href");
      let slug = "",
        num = "";
      if (link) {
        const matches = link.match(/\/([^/]+)-chapter-([^/]+)\//);
        if (matches) {
          slug = matches[1];
          num = matches[2];
        }
      }
      return {
        title: $(`#Judul div.new1:contains('${selector}') a`)
          .text()
          .replace(selector, "")
          .trim(),
        originalLink: link
          ? link.startsWith("http")
            ? link
            : `https://komiku.id${link}`
          : null,
        apiLink: slug && num ? `/api/v1/manga/read/${slug}/${num}` : null,
        chapterNumber: num,
      };
    };

    // --- Daftar Chapter ---
    const chapters = [];
    $("table#Daftar_Chapter tbody tr").each((i, el) => {
      if ($(el).find("th").length > 0) return;
      const chapterLink = $(el).find("td.judulseries a").attr("href");
      let slug = "",
        num = "";
      if (chapterLink) {
        const matches = chapterLink.match(/\/([^/]+)-chapter-([^/]+)\//);
        if (matches) {
          slug = matches[1];
          num = matches[2];
        }
      }
      chapters.push({
        title: $(el).find("td.judulseries a span").text().trim(),
        originalLink: chapterLink
          ? chapterLink.startsWith("http")
            ? chapterLink
            : `https://komiku.id${chapterLink}`
          : null,
        apiLink: slug && num ? `/api/v1/manga/read/${slug}/${num}` : null,
        views: $(el).find("td.pembaca i").text().trim(),
        date: $(el).find("td.tanggalseries").text().trim(),
        chapterNumber: num,
      });
    });

    return {
      title,
      alternativeTitle,
      description,
      sinopsis,
      thumbnail,
      info: infoTable,
      genres,
      slug: komikSlug,
      firstChapter: extractChapterMeta("Awal:"),
      latestChapter: extractChapterMeta("Terbaru:"),
      chapters,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { scrapeKomikDetail };
