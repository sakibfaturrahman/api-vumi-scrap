const shinigamiScraper = require("./scraper/shinigamiScraper");
const kiryuuScraper = require("./scraper/kiryuuScraper");

const fetchMangaByType = async (source, type, page) => {
  // Logika untuk memilih scraper berdasarkan header x-source
  switch (source.toLowerCase()) {
    case "kiryuu":
      return await kiryuuScraper.fetch(type, page);
    case "shinigami":
    default:
      return await shinigamiScraper.fetch(type, page);
  }
};

// PASTIKAN BAGIAN INI ADA DAN BENAR
module.exports = {
  fetchMangaByType,
};
