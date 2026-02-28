const shinigami = require("./scraper/shinigamiScraper");
const kiryuu = require("./scraper/kiryuuScraper");

const fetchMangaDetail = async (source, endpoint) => {
  if (source === "kiryuu") {
    return await kiryuu.getDetail(endpoint);
  }
  return await shinigami.getDetail(endpoint);
};

module.exports = { fetchMangaDetail };
