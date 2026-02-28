const shinigami = require("./scraper/shinigamiScraper");
const kiryuu = require("./scraper/kiryuuScraper");

const fetchChapterImages = async (source, endpoint, chapter) => {
  if (source === "kiryuu") {
    // Di Kiryuu, 'chapter' biasanya lengkap seperti 'chapter-01'
    return await kiryuu.getImages(endpoint, chapter);
  }
  // Di Shinigami, 'chapter' adalah UUID unik
  return await shinigami.getImages(chapter);
};

module.exports = { fetchChapterImages };
