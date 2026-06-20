const https = require('https');

https.get('https://saavn.me/search/songs?query=bruno+mars&page=1&limit=2', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(json.data.results[0].downloadUrl);
    } catch (e) {
      console.log('Error parsing or API is down', data.substring(0, 100));
    }
  });
}).on('error', (e) => console.log('HTTP Error:', e));
