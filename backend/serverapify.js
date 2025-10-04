
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require('dotenv').config();

const app = express();
app.use(cors());
const PORT = process.env.PORT;

// Replace with your values
//const ACTOR_ID = "impassioned_wildfire~my-actor"; 
const ACTOR_ID = "impassioned_wildfire~my-actor";
const APIFY_TOKEN = process.env.APIFY_TOKEN; // store token in .env file

// Endpoint to trigger the actor and fetch results
app.get("/reviews", async (req, res) => {
    try {
        const search = req.query.search || "Stripe";
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        // source is ignored for now

        // 1. Start the actor run
        const run = await axios.post(
            `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
            { search, maxPages: 2 }
        );

        const runId = run.data.data.id;

        // 2. Wait for the run to finish (polling)
        let datasetId;
        while (true) {
            const status = await axios.get(
                `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
            );

            const state = status.data.data.status;
            if (state === "SUCCEEDED") {
                datasetId = status.data.data.defaultDatasetId;
                break;
            } else if (state === "FAILED") {
                throw new Error("Actor run failed");
            }

            await new Promise(r => setTimeout(r, 3000));
        }

        // 3. Fetch results from dataset
        const dataset = await axios.get(
            `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`
        );

        // Transform reviews to only send required fields
                
        let reviews = Array.isArray(dataset.data) ? dataset.data.map(r => ({
            name: r.name,
            title: r.title,
            date: r.date,
            rating: r.overall,
            description: r.description
        })) : [];

        console.log('before filter reviews:', reviews);

        // Filter by startDate and endDate if provided
        if (startDate || endDate) {
            reviews = reviews.filter(r => {
                if (!r.date) return false;
                const reviewDate = new Date(r.date);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;
                if (start && reviewDate < start) return false;
                if (end && reviewDate > end) return false;
                return true;
            });
        }

        console.log('Transformed reviews:', reviews);
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
