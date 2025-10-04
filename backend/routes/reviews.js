const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const {scrapeG2, scrapeCapterra,scrapeTrustRadius } = require('../controller/scraper');





// Main route
router.get("/", async (req, res) => {
  const { company, source, start, end } = req.query;
  if (!company || !source || !start || !end)
    return res.status(400).json({ error: "Missing parameters" });

  const startDate = new Date(start);
  const endDate = new Date(end);

  try {
    let reviews = [];
    if (source === "g2") reviews = await scrapeG2(company, startDate, endDate);
    else if (source === "capterra") reviews = await scrapeCapterra(company, startDate, endDate);
    else if (source === "trustradius") reviews = await scrapeTrustRadius(company, startDate, endDate);
    else return res.status(400).json({ error: "Invalid source" });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

module.exports = router;
