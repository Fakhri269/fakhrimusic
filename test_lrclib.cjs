const https = require('https');

const url = 'https://lrclib.net/api/search?track_name=Blank%20Space&artist_name=Taylor%20Swift';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Result:', json[0] ? json[0].syncedLyrics.substring(0, 200) : 'No result');
    } catch(e) {
      console.log('Parse error', data);
    }
  });
}).on('error', () => console.log('HTTP Error'));
