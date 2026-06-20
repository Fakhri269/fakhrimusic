const https = require('https');
const fs = require('fs');

const terms = ['bruno+mars', 'taylor+swift', 'coldplay', 'nadin+amizah', 'tulus', 'mahalini', 'the+weeknd', 'billie+eilish', 'ed+sheeran', 'dua+lipa'];

async function fetchSongs() {
  let allSongs = [];
  let idCounter = 1;

  for (const term of terms) {
    const url = `https://itunes.apple.com/search?term=${term}&entity=song&limit=10`;
    try {
      const data = await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
      });

      if (data.results) {
        for (const track of data.results) {
          if (track.previewUrl) {
            allSongs.push({
              id: idCounter++,
              title: track.trackName,
              artist: track.artistName,
              album: track.collectionName,
              genre: track.primaryGenreName,
              duration: Math.floor(Math.random() * (300 - 180 + 1)) + 180, // Random duration between 3:00 and 5:00
              cover: track.artworkUrl100.replace('100x100bb', '300x300bb'),
              audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-" + (Math.floor(Math.random() * 16) + 1) + ".mp3", // Full 5-10 minute royalty-free tracks
              plays: Math.floor(Math.random() * 5000000) + 100000,
              liked: false
            });
          }
        }
      }
    } catch (e) {
      console.error('Error fetching', term, e);
    }
  }

  // Shuffle array
  allSongs = allSongs.sort(() => Math.random() - 0.5);

  const fileContent = `// FakhriMusic - Database Lagu (Real metadata + Full fake audio for testing)
// User requested full length audio for testing. Metadata is real from iTunes, but audio is royalty-free.

export const songs = ${JSON.stringify(allSongs, null, 2)}
`;

  fs.writeFileSync('C:/Users/fakhri sidqi/.gemini/antigravity/scratch/fakhrimusic/src/data/songs.js', fileContent);
  console.log('Successfully wrote', allSongs.length, 'songs to songs.js');
}

fetchSongs();
