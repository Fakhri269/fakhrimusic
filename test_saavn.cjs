const https = require('https');

https.get('https://vid.puffyan.us/api/v1/videos/kffacxfA7G4', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.adaptiveFormats) {
        const audio = json.adaptiveFormats.find(f => f.type.includes('audio'));
        console.log('Invidious Success! Audio URL:', audio.url);
      } else {
        console.log('Invidious no audio streams');
      }
    } catch(e) {
      console.log('Invidious parse error', data.substring(0, 100));
    }
  });
}).on('error', () => console.log('Invidious HTTP Error'));
