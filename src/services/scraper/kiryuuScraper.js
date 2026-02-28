const axios = require("axios");
const cheerio = require("cheerio");
const { getHeaders } = require("../../utils/headers");

const getDetail = async (endpoint) => {
  const url = `https://kiryuu03.com/manga/${endpoint}/`;
  const { data } = await axios.get(url, { headers: getHeaders("kiryuu") });
  const $ = cheerio.load(data);

  const chapters = [];
  $("#chapterlist ul li").each((i, el) => {
    chapters.push({
      name: $(el).find(".chapternum").text().trim(),
      endpoint: $(el).find("a").attr("href").split("/").filter(Boolean).pop(),
    });
  });

  return {
    title: $(".entry-title").text().trim(),
    thumbnail: $(".thumb img").attr("src"),
    description: $(".entry-content p").text().trim(),
    chapters,
  };
};

const getImages = async (mangaEndpoint, chapterEndpoint) => {
  // URL Kiryuu: manga/slug-manga/slug-chapter
  const url = `https://kiryuu03.com/manga/${mangaEndpoint}/${chapterEndpoint}/`;
  const { data } = await axios.get(url, { headers: getHeaders("kiryuu") });
  const $ = cheerio.load(data);

  const images = [];
  $("#readerarea img").each((i, el) => {
    const src = $(el).attr("src");
    if (src && !src.includes("loader")) images.push(src.trim());
  });
  return images;
};

module.exports = { getDetail, getImages };
