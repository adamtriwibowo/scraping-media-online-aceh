import { getDb } from "../src/db";
import { sites, keywords } from "../src/db/schema";

type SeedSite = {
  name: string;
  url: string;
  rssUrl?: string;
  category: "lokal" | "nasional";
};

// Best-effort seed list. RSS URLs are filled in only where the standard feed
// path is well known; the rest fall back to homepage scraping and can be
// corrected later from the admin panel once the real feed URL is confirmed.
const seedSites: SeedSite[] = [
  // --- Media lokal Aceh ---
  { name: "Serambi Indonesia", url: "https://aceh.tribunnews.com", category: "lokal" },
  { name: "Waspada Aceh", url: "https://waspadaaceh.com", rssUrl: "https://waspadaaceh.com/feed/", category: "lokal" },
  { name: "ACEHPOST", url: "https://acehpost.id", rssUrl: "https://acehpost.id/feed/", category: "lokal" },
  { name: "Dialeksis", url: "https://dialeksis.com", rssUrl: "https://dialeksis.com/feed/", category: "lokal" },
  { name: "Kanal Aceh", url: "https://kanalaceh.com", rssUrl: "https://kanalaceh.com/feed/", category: "lokal" },
  { name: "Modus Aceh", url: "https://modusaceh.co", rssUrl: "https://modusaceh.co/feed/", category: "lokal" },
  { name: "Harian Rakyat Aceh", url: "https://harianrakyataceh.com", rssUrl: "https://harianrakyataceh.com/feed/", category: "lokal" },
  { name: "Pikiran Merdeka", url: "https://pikiranmerdeka.co", rssUrl: "https://pikiranmerdeka.co/feed/", category: "lokal" },
  { name: "Aceh Terkini", url: "https://acehterkini.com", rssUrl: "https://acehterkini.com/feed/", category: "lokal" },
  { name: "Popularitas.com", url: "https://popularitas.com", rssUrl: "https://popularitas.com/feed/", category: "lokal" },
  { name: "LintasAtjeh", url: "https://www.lintasatjeh.com", rssUrl: "https://www.lintasatjeh.com/feed/", category: "lokal" },
  { name: "Ajnn.net", url: "https://ajnn.net", rssUrl: "https://ajnn.net/feed/", category: "lokal" },
  { name: "Portalsatu", url: "https://portalsatu.com", rssUrl: "https://portalsatu.com/feed/", category: "lokal" },
  { name: "Antara Aceh", url: "https://aceh.antaranews.com", rssUrl: "https://aceh.antaranews.com/rss/aceh.xml", category: "lokal" },
  { name: "RRI Banda Aceh", url: "https://rri.co.id/banda-aceh", category: "lokal" },
  { name: "Kabar Aceh Terkini", url: "https://kabaracehterkini.com", category: "lokal" },
  { name: "Kabar Bener", url: "https://kabarbener.com", category: "lokal" },
  { name: "Analisa Daily", url: "https://analisadaily.com", rssUrl: "https://analisadaily.com/feed/", category: "lokal" },
  { name: "Etnis.co", url: "https://etnis.co", category: "lokal" },
  { name: "Suara Kampus", url: "https://suarakampus.com", rssUrl: "https://suarakampus.com/feed/", category: "lokal" },

  // --- Media nasional ---
  { name: "Kompas", url: "https://www.kompas.com", rssUrl: "https://rss.kompas.com/api/all", category: "nasional" },
  { name: "Detikcom", url: "https://www.detik.com", rssUrl: "https://rss.detik.com/index.php/detikcom", category: "nasional" },
  { name: "CNN Indonesia", url: "https://www.cnnindonesia.com", rssUrl: "https://www.cnnindonesia.com/nasional/rss", category: "nasional" },
  { name: "Tempo", url: "https://www.tempo.co", rssUrl: "https://rss.tempo.co/nasional", category: "nasional" },
  { name: "Republika", url: "https://www.republika.co.id", rssUrl: "https://www.republika.co.id/rss", category: "nasional" },
  { name: "Antara News", url: "https://www.antaranews.com", rssUrl: "https://www.antaranews.com/rss/terkini.xml", category: "nasional" },
];

const seedKeywords: { word: string; label?: string }[] = [
  { word: "aceh", label: "Umum" },
  { word: "banda aceh", label: "Umum" },
  { word: "pemilu", label: "Politik" },
  { word: "pilkada", label: "Politik" },
  { word: "gubernur aceh", label: "Politik" },
  { word: "bencana", label: "Bencana" },
  { word: "banjir", label: "Bencana" },
  { word: "gempa", label: "Bencana" },
  { word: "korupsi", label: "Hukum" },
  { word: "kriminal", label: "Hukum" },
  { word: "ekonomi", label: "Ekonomi" },
  { word: "pendidikan", label: "Pendidikan" },
  { word: "kesehatan", label: "Kesehatan" },
  { word: "syariat islam", label: "Sosial" },
];

async function main() {
  const db = getDb();

  console.log(`Seeding ${seedSites.length} situs...`);
  await db.insert(sites).values(seedSites).onConflictDoNothing({ target: sites.url });

  console.log(`Seeding ${seedKeywords.length} keyword...`);
  await db.insert(keywords).values(seedKeywords).onConflictDoNothing({ target: keywords.word });

  console.log("Selesai.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
