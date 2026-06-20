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
              duration: Math.round(track.trackTimeMillis / 1000), // iTunes gives total track duration, but preview is only 30s. We'll show the real duration in the UI, but the audio element will only play 30s. Let's just use 30 as duration so the progress bar works correctly for the preview.
              previewDuration: 30, // actually the player plays previewUrl which is 30s long. Let's set duration to 30.
              cover: track.artworkUrl100.replace('100x100bb', '300x300bb'),
              audio: track.previewUrl,
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

  const fileContent = `// FakhriMusic - Database Lagu (Real previews via iTunes API)
// All songs provided are 30-second previews.

export const songs = ${JSON.stringify(allSongs, null, 2).replace(/"duration": (\d+),/g, '"duration": 30, // Preview is 30s')}
`;

  fs.writeFileSync('C:/Users/fakhri sidqi/.gemini/antigravity/scratch/fakhrimusic/src/data/songs.js', fileContent);
  console.log('Successfully wrote', allSongs.length, 'songs to songs.js');
}

fetchSongs();
