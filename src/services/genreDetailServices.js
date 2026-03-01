const axios = require("axios");
const cheerio = require("cheerio");
const { SOURCES } = require("../utils/constants");
const { getHeaders } = require("../utils/headers");

/**
 * Helper untuk membersihkan dan memformat link chapter ke API internal
 */
const formatChapterApiLink = (mangaSlug, chapterText) => {
  if (!mangaSlug || !chapterText) return null;
  const chapterNum = chapterText.replace(/[^0-9]/g, "");
  return `/api/v1/manga/read/${mangaSlug}/${chapterNum}`;
};

/**
 * Service untuk mengambil daftar manga berdasarkan genre
 */
const fetchMangaByGenre = async (slug, pageNum) => {
  const URL_KOMIKU = SOURCES.komiku || "https://komiku.org/";
  // Menggunakan API URL sesuai referensi kode Anda
  const targetUrl = `https://api.komiku.org/genre/${slug}/page/${pageNum}/`;

  const { data } = await axios.get(targetUrl, {
    headers: getHeaders("komiku"),
    timeout: 15000,
  });

  const $ = cheerio.load(data);
  const mangaList = [];

  // Selector utama adalah .bge, namun kita siapkan fallback
  let mangaElements = $(".bge");
  if (mangaElements.length === 0) {
    mangaElements = $(".daftar .bge, .list-manga .item, .manga-item, .entry");
  }

  mangaElements.each((i, el) => {
    const $el = $(el);

    // Judul & Slug
    let title =
      $el.find(".kan h3").text().trim() ||
      $el.find("h3, h2, .title").text().trim();
    const mangaLink =
      $el.find(".kan a").first().attr("href") ||
      $el.find("a").first().attr("href");

    let mangaSlug = "";
    if (mangaLink) {
      const slugMatch = mangaLink.match(/\/manga\/([^/]+)/);
      mangaSlug = slugMatch ? slugMatch[1] : "";
    }

    // Thumbnail (dengan Lazy Load Support)
    const imgEl = $el.find(".bgei img, img").first();
    let thumbnail =
      imgEl.attr("src") || imgEl.attr("data-src") || imgEl.attr("data-lazy");

    // Tipe & Genre
    const typeGenreElement = $el.find(".tpe1_inf");
    const type = typeGenreElement.find("b").text().trim();
    const genre = typeGenreElement.text().replace(type, "").trim();

    // Chapter Info
    const chapterElements = $el.find(".new1 a");
    const getChapInfo = (index) => {
      const el = $(chapterElements[index]);
      const text = el.find("span").last().text().trim();
      return text
        ? {
            chapter: text,
            apiLink: formatChapterApiLink(mangaSlug, text),
          }
        : null;
    };

    if (title && thumbnail) {
      mangaList.push({
        title,
        slug: mangaSlug,
        type,
        genre,
        thumbnail,
        description: $el.find(".kan p").text().trim(),
        updateStatus: $el.find(".up").text().trim(),
        apiMangaLink: mangaSlug ? `/api/v1/manga/detail/${mangaSlug}` : null,
        chapters: {
          first: getChapInfo(0),
          latest: getChapInfo(1),
        },
      });
    }
  });

  // Pagination Logic
  const hasNextPage =
    $("#hxloading").length > 0 || $(".pagination .next").length > 0;

  return {
    genre: slug,
    currentPage: pageNum,
    totalManga: mangaList.length,
    hasNextPage,
    nextPageUrl: hasNextPage
      ? `/api/v1/manga/genre/${slug}/page/${pageNum + 1}`
      : null,
    data: mangaList,
  };
};

module.exports = { fetchMangaByGenre };
