const imageSearchService = require("../services/imageSearchService");

async function searchImages(req, res) {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Query parameter q is required" });
  }

  try {
    const results = await imageSearchService.searchImages(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch images from query" });
  }
}

module.exports = {
  searchImages,
};
