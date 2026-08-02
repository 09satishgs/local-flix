// Native fetch queries for DuckDuckGo
async function searchImages(query) {
  const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
  const mainResponse = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  const mainHtml = await mainResponse.text();
  
  const vqdMatch = mainHtml.match(/vqd=([^&'"]+)/) || mainHtml.match(/vqd\s*=\s*['"]([^'"]+)['"]/);
  if (!vqdMatch) {
    throw new Error("Failed to perform image search search tokens");
  }
  const vqd = vqdMatch[1];

  const imagesUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,`;
  const imagesResponse = await fetch(imagesUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Referer': 'https://duckduckgo.com/'
    }
  });
  
  const data = await imagesResponse.json();
  const results = (data.results || []).map(r => ({
    title: r.title,
    image: r.image,
    thumbnail: r.thumbnail
  })).slice(0, 30);

  return results;
}

module.exports = {
  searchImages,
};
