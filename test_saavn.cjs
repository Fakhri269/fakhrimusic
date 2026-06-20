const https = require('https');

https.get('https://discoveryprovider.audius.co/v1/tracks/trending?app_name=fakhrimusic', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Success:', !!json.data);
      if (json.data && json.data[0]) {
        console.log('Audio URL:', 'https://discoveryprovider.audius.co/v1/tracks/' + json.data[0].id + '/stream?app_name=fakhrimusic');
        console.log('Name:', json.data[0].title);
      }
    } catch (e) {
      console.log('Parse error', data.substring(0, 100));
    }
  });
}).on('error', (e) => console.log('HTTP Error:', e));
