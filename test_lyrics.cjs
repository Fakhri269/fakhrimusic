const https = require('https');

https.get('https://api.lyrics.ovh/v1/Taylor Swift/Blank Space', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Lyrics snippet:', json.lyrics ? json.lyrics.substring(0, 100) : 'No lyrics');
    } catch(e) {
      console.log('Parse error', data);
    }
  });
}).on('error', () => console.log('HTTP Error'));
