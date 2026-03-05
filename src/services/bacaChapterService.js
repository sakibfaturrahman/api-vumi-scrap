const axios = require("axios");
const cheerio = require("cheerio");
const { SOURCES } = require("../utils/constants");
const { getHeaders } = require("../utils/headers");

/**
 * Helper untuk mengekstrak slug dan chapter dari URL Komiku
 */
const extractSlugAndChapter = (url) => {
  if (!url) return { slug: "", chapter: "" };

  // Regex diperkuat untuk menangkap pola slug sebelum '-chapter-'
  const regex = /https?:\/\/komiku\.id\/([a-z0-9-]+)-chapter-([a-z0-9.]+)/i;
  const matches = url.match(regex);

  if (matches) {
    return {
      slug: matches[1],
      chapter: matches[2],
    };
  }

  // Fallback untuk format slug-chapter-angka tanpa domain
  const simpleRegex = /([a-z0-9-]+)-chapter-([a-z0-9.]+)/i;
  const simpleMatches = url.match(simpleRegex);
  if (simpleMatches) {
    return {
      slug: simpleMatches[1],
      chapter: simpleMatches[2],
    };
  }

  return { slug: "", chapter: "" };
};

/**
 * Fungsi utama untuk scraping data chapter
 */
const fetchChapterData = async (slug, chapter) => {
  // 1. Definisikan Base URL dengan protokol yang lengkap
  const URL_BASE = "https://komiku.org";

  // 2. Bersihkan input slug dan chapter dari whitespace/karakter aneh
  const cleanSlug = slug.trim();
  const cleanChapter = chapter.toString().trim().replace(/^0+/, "") || "0";

  // 3. Gabungkan URL dengan slash yang pasti (mencegah ENOTFOUND)
  const chapterUrl = `${URL_BASE}/${cleanSlug}-chapter-${cleanChapter}/`;

  console.log(`[VUMI DEBUG] Scraping URL: ${chapterUrl}`);

  try {
    const { data } = await axios.get(chapterUrl, {
      headers: getHeaders("komiku"),
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const images = [];

    // 4. Ambil gambar dengan penanganan Lazy Load (data-src)
    $("#Baca_Komik img").each((i, el) => {
      let src = $(el).attr("data-src") || $(el).attr("src");

      if (src && (src.includes("upload") || src.includes("cdn"))) {
        // Normalisasi URL gambar
        if (src.startsWith("//")) src = `https:${src}`;

        images.push({
          page: i + 1,
          src: src,
          alt: $(el).attr("alt") || `Page ${i + 1}`,
          // Fallback server jika CDN utama lambat di HP Infinix kamu
          fallbackSrc: src.replace("cdn.komiku.id", "img.komiku.id"),
        });
      }
    });

    // 5. Ekstraksi Navigasi (Prev/Next)
    const prevLink = $(".nxpr a.rl").attr("href") || "";
    const nextLink = $(".nxpr a.rr").attr("href") || "";

    return {
      title:
        $("#Judul h1").text().trim() || `${cleanSlug} Chapter ${cleanChapter}`,
      slug: cleanSlug,
      chapter: cleanChapter,
      images: images,
      navigation: {
        prev: extractSlugAndChapter(prevLink).chapter || null,
        next: extractSlugAndChapter(nextLink).chapter || null,
      },
    };
  } catch (error) {
    // Memberikan log error detail agar mudah dilacak di Redmibook kamu
    console.error(`[SCRAPE ERROR] URL: ${chapterUrl} | Msg: ${error.message}`);
    throw new Error(
      `Gagal memuat chapter. Pastikan slug '${cleanSlug}' benar.`,
    );
  }
};

module.exports = {
  fetchChapterData,
  extractSlugAndChapter,
};
