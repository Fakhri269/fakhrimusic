const fs = require('fs');
let code = fs.readFileSync('src/data/songs.js', 'utf-8');

const artistsToGenre = [
  { name: 'Justin Bieber', genre: 'Pop' },
  { name: 'Taylor Swift', genre: 'Pop' },
  { name: 'Bruno Mars', genre: 'R&B' },
  { name: 'Dua Lipa', genre: 'Pop' },
  { name: 'The Weeknd', genre: 'R&B' },
  { name: 'Post Malone', genre: 'Hip Hop' },
  { name: 'Harry Styles', genre: 'Indie Pop' },
  { name: 'Ed Sheeran', genre: 'Acoustic' },
  { name: 'Adele', genre: 'Pop' },
  { name: 'Coldplay', genre: 'Rock' },
  { name: 'Maroon 5', genre: 'Pop' },
  { name: 'BTS', genre: 'K-Pop' },
  { name: 'IU', genre: 'K-Pop' },
  { name: 'Charlie Puth', genre: 'Pop' },
  { name: 'Lewis Capaldi', genre: 'Acoustic' },
  { name: 'Olivia Rodrigo', genre: 'Pop' },
  { name: 'Ariana Grande', genre: 'Pop' },
  { name: 'Lyodra', genre: 'Indo Pop' },
  { name: 'Via Vallen', genre: 'Dangdut' },
  { name: 'BCL', genre: 'Indo Pop' },
  { name: 'Afgan', genre: 'Indo Pop' },
  { name: 'Once', genre: 'Indo Rock' },
  { name: 'Glenn Fredly', genre: 'Indo R&B' },
  { name: 'Judika', genre: 'Indo Pop' },
  { name: 'Barasuara', genre: 'Indie' },
  { name: 'Payung Teduh', genre: 'Acoustic' },
  { name: 'Yura Yunita', genre: 'Indo Pop' },
  { name: 'Ardhito Pramono', genre: 'Jazz' },
  { name: 'Fourtwnty', genre: 'Indie' },
  { name: 'Justin Timberlake', genre: 'Pop' },
  { name: 'BLACKPINK', genre: 'K-Pop' },
  { name: 'NewJeans', genre: 'K-Pop' },
  { name: 'Dewa 19', genre: 'Indo Rock' },
  { name: 'Kangen Band', genre: 'Indo Pop' },
  { name: 'Peterpan', genre: 'Indo Rock' },
  { name: 'Nidji', genre: 'Indo Rock' },
  { name: 'Gigi', genre: 'Indo Rock' }
];

let updatedCode = code.replace(/artist:\s*"([^"]+)",\n\s*album:\s*"([^"]+)",\n\s*genre:\s*"([^"]+)"/g, (match, artist, album, genre) => {
  let newGenre = genre;
  for (const mapping of artistsToGenre) {
    if (artist.includes(mapping.name)) {
      newGenre = mapping.genre;
      break;
    }
  }
  return `artist: "${artist}",\n    album: "${album}",\n    genre: "${newGenre}"`;
});

fs.writeFileSync('src/data/songs.js', updatedCode);
console.log('Genres updated.');
