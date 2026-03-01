const axios = require("axios");
const cheerio = require("cheerio");
const { SOURCES } = require("../utils/constants");
const { getHeaders } = require("../utils/headers");

/**
 * Helper untuk parsing item manga dari elemen .bge
 */
const parseMangaItem = ($, el) => {
  const bgei = $(el).find(".bgei");
  const kan = $(el).find(".kan");
  const mangaLink = bgei.find("a").attr("href") || "";
  const slug = mangaLink.replace("/manga/", "").replace(/\/$/, "");
  const type = bgei.find(".tpe1_inf b").text().trim();

  return {
    title: kan.find("h3").text().trim(),
    altTitle: kan.find(".judul2").text().trim() || null,
    slug: slug,
    apiDetailLink: slug ? `/api/v1/manga/detail/${slug}` : null,
    thumbnail: bgei.find("img").attr("src") || "",
    type: type,
    genre: bgei.find(".tpe1_inf").text().replace(type, "").trim() || null,
    description: kan.find("p").text().trim(),
  };
};

/**
 * Service utama untuk mencari manga
 */
const searchManga = async (keyword) => {
  const searchUrl = `${SOURCES.komiku}/?s=${encodeURIComponent(keyword)}&post_type=manga`;
  const { data } = await axios.get(searchUrl, {
    headers: getHeaders("komiku"),
  });
  const $ = cheerio.load(data);
  let results = [];

  // 1. Cek apakah ada elemen HTMX (Komiku sering pakai ini untuk search)
  const htmxElement = $(".daftar span[hx-get]");
  if (htmxElement.length > 0) {
    const htmxApiUrl = htmxElement.attr("hx-get");
    if (htmxApiUrl) {
      try {
        const htmxRes = await axios.get(htmxApiUrl, {
          headers: { ...getHeaders("komiku"), "HX-Request": "true" },
        });
        const $htmx = cheerio.load(htmxRes.data);
        $htmx(".bge").each((i, el) => results.push(parseMangaItem($htmx, el)));
      } catch (e) {
        console.error("HTMX Search Failed, falling back...");
      }
    }
  }

  // 2. Jika HTMX gagal atau kosong, gunakan parsing reguler
  if (results.length === 0) {
    $(".bge").each((i, el) => results.push(parseMangaItem($, el)));
  }

  // 3. Generic Parser (Metode terakhir jika masih kosong)
  if (results.length === 0) {
    $("a").each((i, el) => {
      const href = $(el).attr("href") || "";
      if (href.includes("/manga/")) {
        const title = $(el).text().trim();
        const slug = href.replace(/^.*\/manga\//, "").replace(/\/$/, "");
        if (title.length > 3) {
          results.push({
            title,
            slug,
            apiDetailLink: `/api/v1/manga/detail/${slug}`,
            thumbnail: $(el).find("img").attr("src") || "",
            source: "generic-parser",
          });
        }
      }
    });
    // Hilangkan duplikat slug
    const seen = new Set();
    results = results.filter((item) =>
      seen.has(item.slug) ? false : seen.add(item.slug),
    );
  }

  return { keyword, total: results.length, data: results };
};

module.exports = { searchManga };
