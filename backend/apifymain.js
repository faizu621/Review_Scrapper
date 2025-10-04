// src/main.js
import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';
import fs from 'fs';

await Actor.main(async () => {
    const input = await Actor.getInput() || {};
    const { search = "zoom", maxPages = 3, source = "capterra" } = input;

    const allReviews = [];

    const proxyConfiguration = await Actor.createProxyConfiguration({
        groups: ["RESIDENTIAL"],
        useApifyProxy: true,
    });

    // ---------- CAPTERRA SCRAPER ----------
    const runCapterraScraper = async () => {
        const startUrls = [
            { url: `https://www.capterra.com/search/?query=${encodeURIComponent(search)}` }
        ];

        const crawler = new PlaywrightCrawler({
            proxyConfiguration,
            maxRequestsPerCrawl: maxPages,
            launchContext: { launchOptions: { headless: true } },
            preNavigationHooks: [
                async ({ page }) => {
                    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
                    await page.addInitScript((ua) => {
                        Object.defineProperty(navigator, 'userAgent', { get: () => ua });
                    }, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                    "AppleWebKit/537.36 (KHTML, like Gecko) " +
                    "Chrome/120.0.0.0 Safari/537.36");
                }
            ],
            async requestHandler({ page, request, enqueueLinks, log }) {
                log.info(`Processing: ${request.url}`);

                // Step 1: Search → Product page
                if (request.url.includes("/search/")) {
                    const firstProductLink = await page.$eval('a[href*="/p/"]', link => link.href);
                    if (firstProductLink) {
                        const reviewsUrl = firstProductLink.endsWith('/') ? `${firstProductLink}reviews/` : `${firstProductLink}/reviews/`;
                        log.info(`Enqueuing reviews page: ${reviewsUrl}`);
                        await enqueueLinks({ urls: [reviewsUrl] });
                    }
                    return;
                }

                // Step 2: Extract reviews
                await page.waitForSelector('.flex.flex-col.gap-8', { timeout: 20000 }).catch(() => {
                    log.warning("No reviews found on this page.");
                    return;
                });

                await page.evaluate(() => window.scrollBy(0, window.innerHeight));
                await page.waitForTimeout(2000);

                const reviews = await page.$$eval('.flex.flex-col.gap-8', cards =>
                    cards.map(card => {
                        const reviewerInfo = card.querySelector('.typo-10.text-neutral-90');
                        const name = reviewerInfo?.querySelector('span.typo-20.font-semibold')?.textContent.trim() || null;

                        const title = card.querySelector('h3.typo-20.font-semibold')?.textContent.trim() || null;
                        const date = card.querySelector('.typo-0.text-neutral-90')?.textContent.trim() || null;

                        const overall = card.querySelector('[data-testid="Overall Rating-rating"] span.sr2r3oj')?.textContent.trim() || null;

                        const description = card.querySelector('div > p')?.textContent.trim() || null;

                        let pros = null, cons = null;
                        card.querySelectorAll('div.space-y-2').forEach(section => {
                            const svgTitle = section.querySelector('svg')?.getAttribute('title');
                            const text = section.querySelector('p')?.textContent.trim() || null;
                            if (svgTitle === 'Positive icon') pros = text;
                            if (svgTitle === 'Negative icon') cons = text;
                        });

                        return { source: "capterra", name, title, date, overall, description, pros, cons };
                    })
                );

                if (reviews.length > 0) {
                    allReviews.push(...reviews);
                    for (const review of reviews) {
                        await Actor.pushData(review);
                    }
                }

                // Step 3: Next page
                await enqueueLinks({
                    selector: 'a.pagination__link--next',
                    label: 'NEXT',
                });
            },
            failedRequestHandler({ request, log }) {
                log.error(`Request ${request.url} failed too many times.`);
            },
        });

        await crawler.run(startUrls);
    };

    // ---------- G2 SCRAPER ----------
    const runG2Scraper = async () => {
        const productSlug = search.toLowerCase().split(" ").join("-");
        const startUrls = [
            { url: `https://www.g2.com/products/${productSlug}/reviews` }
        ];

        const crawler = new PlaywrightCrawler({
            proxyConfiguration,
            maxRequestsPerCrawl: maxPages,
            launchContext: { launchOptions: { headless: true } },
            async requestHandler({ page, request, enqueueLinks, log }) {
                log.info(`Processing: ${request.url}`);

                // Step 1: Extract reviews
                await page.waitForSelector('.elv-flex.elv-flex-col.elv-gap-y-4.elv-py-3', { timeout: 20000 }).catch(() => {
                    log.warning("No reviews found on this G2 page.");
                    return;
                });

                await page.evaluate(() => window.scrollBy(0, window.innerHeight));
                await page.waitForTimeout(2000);

                const reviews = await page.$$eval('.elv-flex.elv-flex-col.elv-gap-y-4.elv-py-3', cards =>
                    cards.map(card => {
                        const name = card.closest(".elv-flex.elv-justify-between")?.querySelector('[itemprop="name"]')?.content
                            || card.closest(".elv-flex.elv-justify-between")?.querySelector("div.elv-font-bold")?.textContent.trim()
                            || null;

                        const date = card.closest(".elv-flex.elv-justify-between")?.querySelector('[itemprop="datePublished"]')?.content
                            || card.closest(".elv-flex.elv-justify-between")?.querySelector("span label")?.textContent.trim()
                            || null;

                        const title = card.querySelector('[itemprop="name"] div')?.textContent.trim() || null;
                        const rating = card.querySelector('label.elv-text-subtle')?.textContent.trim() || null;
                        const description = card.querySelector('[itemprop="reviewBody"]')?.textContent.trim() || null;

                        return { source: "g2", name, title, date, rating, description };
                    })
                );

                if (reviews.length > 0) {
                    allReviews.push(...reviews);
                    for (const review of reviews) {
                        await Actor.pushData(review);
                    }
                }

                // Step 2: Next page
                await enqueueLinks({
                    selector: 'a[rel="next"]',
                    label: 'NEXT',
                });
            },
            failedRequestHandler({ request, log }) {
                log.error(`Request ${request.url} failed too many times.`);
            },
        });

        await crawler.run(startUrls);
    };

    // ---------- MAIN SWITCH ----------
    if (source.toLowerCase() === "capterra") {
        await runCapterraScraper();
    } else if (source.toLowerCase() === "g2") {
        await runG2Scraper();
    } else {
        console.error("❌ Invalid source provided. Use 'capterra' or 'g2'.");
    }

    // Save locally
    fs.writeFileSync('reviews.json', JSON.stringify(allReviews, null, 2), 'utf-8');
    console.log(`✅ Saved ${allReviews.length} reviews to reviews.json`);
});