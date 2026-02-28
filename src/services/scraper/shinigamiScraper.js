const axios = require("axios");
const cheerio = require("cheerio");
const { getHeaders } = require("../../utils/headers");

const getDetail = async (endpoint) => {
  const url = `https://09.shinigami.asia/series/${endpoint}`;
  const { data } = await axios.get(url, { headers: getHeaders("shinigami") });
  const $ = cheerio.load(data);

  const chapters = [];
  // Selector terbaru untuk daftar chapter di tema Madara Shinigami
  $(".wp-manga-chapter").each((i, el) => {
    const aTag = $(el).find("a");
    chapters.push({
      name: aTag.text().trim(),
      // Mengambil UUID di akhir URL
      endpoint: aTag.attr("href")?.split("/").filter(Boolean).pop(),
    });
  });

  return {
    title:
      $(".post-title h1").text().trim() ||
      $(".breadcrumb li.active").text().trim(),
    thumbnail:
      $(".summary_image img").attr("src") ||
      $(".summary_image img").attr("data-src"),
    description:
      $(".description-summary .summary__content").text().trim() ||
      $(".manga-excerpt").text().trim(),
    chapters,
  };
};

const getImages = async (chapterEndpoint) => {
  const url = `https://09.shinigami.asia/chapter/${chapterEndpoint}`;
  const { data } = await axios.get(url, { headers: getHeaders("shinigami") });
  const $ = cheerio.load(data);

  const images = [];
  // Selector untuk gambar di dalam viewer
  $(".reading-content img").each((i, el) => {
    const src =
      $(el).attr("src") ||
      $(el).attr("data-src") ||
      $(el).attr("data-lazy-src");
    if (src && !src.includes("banner")) {
      images.push(src.trim());
    }
  });

  return images;
};

module.exports = { getDetail, getImages };
