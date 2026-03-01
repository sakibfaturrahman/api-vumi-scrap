const axios = require("axios");
const cheerio = require("cheerio");
const { getHeaders } = require("../utils/headers");

/**
 * Helper internal: Menghasilkan delay acak 1-3 detik
 */
const getRandomDelay = () =>
  Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);

/**
 * Helper internal: Ekstrak slug dari URL
 */
const extractSlug = (url) => {
  if (!url) return "";
  const matches = url.match(/\/manga\/(.*?)\//);
  return matches ? matches[1] : "";
};

/**
 * Helper internal: Format URL Chapter menjadi API path
 */
const formatChapterUrl = (url) => {
  if (!url) return null;
  const match = url.match(/\/([^/]+)-chapter-(\d+)/);
  if (match) {
    const [, title, chapter] = match;
    return `/api/v1/manga/read/${title}/${chapter}`;
  }
  return url;
};

/**
 * Fungsi utama untuk scraping data pustaka (Manga List)
 */
const scrapePustakaData = async (page = 1) => {
  try {
    // Anti-spam delay
    await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));

    const response = await axios.get(
      `https://api.komiku.id/manga/page/${page}/`,
      {
        headers: getHeaders("komiku"),
        timeout: 10000,
      },
    );

    const $ = cheerio.load(response.data);
    const mangaList = [];

    $(".bge").each((i, element) => {
      const url = $(element).find(".bgei a").attr("href");
      const slug = extractSlug(url);

      // Selector spesifik untuk chapter awal dan terbaru
      const firstChapterElement = $(element).find(
        ".new1 a[title*='Chapter']:first",
      );
      const lastChapterElement = $(element).find(
        ".new1 a[title*='Chapter']:last",
      );

      mangaList.push({
        title: $(element).find(".kan h3").text().trim(),
        thumbnail: $(element).find(".bgei img").attr("src"),
        type: $(element).find(".tpe1_inf b").text().trim(),
        genre: $(element)
          .find(".tpe1_inf")
          .text()
          .replace($(element).find(".tpe1_inf b").text(), "")
          .trim(),
        endpoint: slug,
        apiDetailLink: slug ? `/api/v1/manga/detail/${slug}` : null,
        description: $(element).find(".kan p").text().trim(),
        stats: $(element).find(".judul2").text().trim(),
        firstChapter: firstChapterElement.length
          ? {
              title: firstChapterElement.attr("title"),
              url: formatChapterUrl(firstChapterElement.attr("href")),
            }
          : null,
        latestChapter: lastChapterElement.length
          ? {
              title: lastChapterElement.attr("title"),
              url: formatChapterUrl(lastChapterElement.attr("href")),
            }
          : null,
      });
    });

    return {
      page: page,
      total_items: mangaList.length,
      results: mangaList,
    };
  } catch (error) {
    throw new Error(`Scraping Pustaka Gagal: ${error.message}`);
  }
};

module.exports = { scrapePustakaData };
