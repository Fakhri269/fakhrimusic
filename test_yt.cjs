const ytSearch = require('yt-search');

async function test() {
  const r = await ytSearch('Justin Bieber Peaches Vevo');
  const videos = r.videos;
  if (videos.length > 0) {
    console.log(videos[0].title, videos[0].videoId);
  }
}
test();
