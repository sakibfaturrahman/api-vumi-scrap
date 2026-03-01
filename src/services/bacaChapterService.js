const axios = require("axios");
const cheerio = require("cheerio");
const { SOURCES } = require("../utils/constants");
const { getHeaders } = require("../utils/headers");

/**
 * Helper untuk mengekstrak slug dan chapter dari URL
 */
const extractSlugAndChapter = (url) => {
  const matches =
    url.match(/\/([^\/]+?)-chapter-([^\/]+?)(?:\/|$)/) ||
    url.match(/\/manga\/[^\/]+\/chapter\/([^\/]+?)(?:\/|$)/);

  if (matches && matches[1] && matches[2]) {
    return { slug: matches[1], chapter: matches[2] };
  }
  return { slug: "", chapter: "" };
};

/**
 * Fungsi utama untuk scraping data chapter
 */
const fetchChapterData = async (slug, chapter) => {
  const URL_BASE = SOURCES.komiku || "https://komiku.org/";
  const chapterUrl = `${URL_BASE}${slug}-chapter-${chapter}/`;

  const { data } = await axios.get(chapterUrl, {
    headers: getHeaders("komiku"),
    timeout: 10000,
  });

  const $ = cheerio.load(data);

  // --- Ekstraksi Data Manga ---
  const title = $("#Judul h1").text().trim();
  const mangaTitleElement = $("#Judul p a b");
  const mangaLink = mangaTitleElement.parent().attr("href");

  let mangaSlug = "";
  if (mangaLink) {
    const matches = mangaLink.match(/\/manga\/([^/]+)/);
    mangaSlug = matches ? matches[1] : "";
  }

  // --- Ekstraksi Gambar ---
  const images = [];
  $("#Baca_Komik img").each((i, el) => {
    const src = $(el).attr("src");
    if (src && src.includes("upload") && $(el).attr("id")) {
      images.push({
        src,
        alt: $(el).attr("alt"),
        id: $(el).attr("id"),
        fallbackSrc: src.replace("cdn.komiku.id", "img.komiku.id"),
      });
    }
  });

  // --- Navigasi ---
  const prevChapterLink = $(".nxpr a.rl[href*='-chapter-']").attr("href") || "";
  const nextChapterLink = $(".nxpr a.rr[href*='-chapter-']").attr("href") || "";

  const formatNav = (link) => {
    if (!link) return null;
    const { slug: s, chapter: c } = extractSlugAndChapter(link);
    return {
      originalLink: link.startsWith("http")
        ? link
        : `${URL_BASE}${link.startsWith("/") ? link.substring(1) : link}`,
      apiLink: `/api/v1/manga/read/${s}/${c}`,
      slug: s,
      chapter: c,
    };
  };

  return {
    title,
    mangaInfo: {
      title: mangaTitleElement.text().trim(),
      slug: mangaSlug,
      apiLink: mangaSlug ? `/api/v1/manga/detail/${mangaSlug}` : null,
    },
    description: $("#Description").first().text().trim(), // Disederhanakan
    images,
    meta: {
      chapterNumber: $(".chapterInfo").attr("valuechapter") || chapter,
      totalImages:
        parseInt($(".chapterInfo").attr("valuegambar")) || images.length,
      publishDate: $("time").first().text().trim(),
    },
    navigation: {
      prevChapter: formatNav(prevChapterLink),
      nextChapter: formatNav(nextChapterLink),
    },
  };
};

module.exports = {
  fetchChapterData,
  extractSlugAndChapter,
};
