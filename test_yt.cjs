const ytSearch = require('yt-search');

const songs = [
  { id: 1, q: 'Justin Bieber Peaches official music video' },
  { id: 2, q: 'The Kid LAROI Justin Bieber STAY official music video' },
  { id: 3, q: 'Justin Bieber Ghost official music video' },
  { id: 4, q: 'Justin Bieber Love Yourself official music video' },
  { id: 5, q: 'Taylor Swift Blank Space official music video' },
  { id: 6, q: 'Taylor Swift Cruel Summer official music video' },
  { id: 7, q: 'Bruno Mars Just The Way You Are official music video' },
  { id: 8, q: 'Bruno Mars Locked Out Of Heaven official music video' },
  { id: 9, q: 'The Weeknd Blinding Lights official music video' },
  { id: 10, q: 'The Weeknd Starboy official music video' },
  { id: 11, q: 'Nadin Amizah Rayuan Perempuan Gila official music video' },
  { id: 12, q: 'Tulus Hati-Hati di Jalan official music video' },
  { id: 13, q: 'Mahalini Sial official music video' },
  { id: 14, q: 'Billie Eilish bad guy official music video' },
  { id: 15, q: 'Ed Sheeran Shape of You official music video' },
];

async function main() {
  for (const s of songs) {
    try {
      const r = await ytSearch(s.q);
      if (r.videos.length > 0) {
        const v = r.videos[0];
        console.log(`ID ${s.id}: "${v.title}" => ${v.videoId} (${v.views} views)`);
      }
    } catch(e) {
      console.log(`ID ${s.id}: ERROR`);
    }
  }
}
main();
