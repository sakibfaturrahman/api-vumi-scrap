const axios = require("axios");
const cheerio = require("cheerio");
const { getHeaders } = require("../utils/headers");

/**
 * Helper internal: Menghasilkan delay acak 1-3 detik
 */
const getRandomDelay = () =>
  Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);

/**
 * Helper internal: Ekstrak slug dari URL Komiku
 */
const extractSlug = (url) => {
  if (!url || typeof url !== "string") return "";
  try {
    const matches = url.match(/\/manga\/(.*?)\//);
    return matches && matches[1] ? matches[1] : "";
  } catch (error) {
    return "";
  }
};

/**
 * Helper internal: Format URL Chapter menjadi API path
 */
const formatChapterUrl = (url) => {
  const match = url.match(/\/([^/]+)-chapter-(\d+)/);
  if (match) {
    const [, title, chapter] = match;
    return `/api/v1/manga/read/${title}/${chapter}`;
  }
  return url;
};

/**
 * Fungsi utama Scraping daftar Komik Berwarna
 */
const scrapeBerwarnaData = async (page = 1) => {
  const validPage = Math.max(1, parseInt(page) || 1);

  // Delay sebelum request untuk meminimalisir deteksi bot
  await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));

  const url =
    validPage === 1
      ? "https://api.komiku.org/other/berwarna/"
      : `https://api.komiku.org/other/berwarna/page/${validPage}/`;

  const response = await axios.get(url, {
    headers: getHeaders("komiku"),
    timeout: 15000,
  });

  const $ = cheerio.load(response.data);
  const mangaList = [];

  $(".bge").each((i, element) => {
    const $el = $(element);
    const rawUrl = $el.find(".bgei a").attr("href") || "";
    const slug = extractSlug(rawUrl);

    const firstChapterElement = $el.find(".new1 a").first();
    const lastChapterElement = $el.find(".new1 a").last();

    mangaList.push({
      title: $el.find("h3").text().trim() || `Manga ${i + 1}`,
      thumbnail: $el.find(".sd").attr("src") || "",
      type: $el.find(".tpe1_inf b").text().trim() || "Unknown",
      genre:
        $el
          .find(".tpe1_inf")
          .text()
          .replace($el.find(".tpe1_inf b").text(), "")
          .trim() || "",
      endpoint: slug,
      detailUrl: slug ? `/api/v1/manga/detail/${slug}` : "",
      description: $el.find(".kan p").text().trim() || "",
      firstChapter: firstChapterElement.length
        ? {
            title: firstChapterElement.attr("title") || "",
            url: formatChapterUrl(firstChapterElement.attr("href") || ""),
          }
        : null,
      latestChapter: lastChapterElement.length
        ? {
            title: lastChapterElement.attr("title") || "",
            url: formatChapterUrl(lastChapterElement.attr("href") || ""),
          }
        : null,
    });
  });

  return {
    page: validPage,
    results: mangaList,
    total: mangaList.length,
    success: true,
  };
};

module.exports = {
  scrapeBerwarnaData,
};
