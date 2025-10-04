// scraper.js
const { PlaywrightCrawler, ProxyConfiguration } = require('crawlee');
const fs = require('fs');
require('dotenv').config();


const scrapeCapterraReviews = async (search = "Stripe", maxPages = 3) => {
    const startUrls = [
        { url: `https://www.capterra.com/search/?query=${encodeURIComponent(search)}` }
    ];

    // ✅ Use Apify Proxy via proxyUrls instead of groups
    const proxyConfiguration = new ProxyConfiguration({
        proxyUrls: [
            `http://auto:${process.env.APIFY_PROXY_PASSWORD}@proxy.apify.com:8000`
        ]
    });

    const allReviews = [];

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

            if (request.url.includes("/search/")) {
                const firstProductLink = await page.$eval('a[href*="/p/"]', link => link.href);
                if (firstProductLink) {
                    const reviewsUrl = firstProductLink.endsWith('/') ? `${firstProductLink}reviews/` : `${firstProductLink}/reviews/`;
                    await enqueueLinks({ urls: [reviewsUrl] });
                }
                return;
            }

            await page.waitForSelector('.flex.flex-col.gap-y-2', { timeout: 20000 }).catch(() => log.warning("No reviews found."));

            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await page.waitForTimeout(2000);

            const reviews = await page.$$eval('.flex.flex-col.gap-y-2', cards =>
                cards.map(card => {
                    const reviewerInfo = card.querySelector('.typo-10.text-neutral-90');
                    const name = reviewerInfo?.querySelector('span.typo-20.font-semibold')?.textContent.trim() || null;
                    const details = reviewerInfo?.innerHTML.split('<br>').map(t => t.replace(/<[^>]*>/g, '').trim()) || [];
                    const role = details[0] || null;
                    const industry = details[1] || null;
                    const experience = details[2] || null;

                    const title = card.querySelector('h3.typo-20.font-semibold')?.textContent.trim() || null;
                    const date = card.querySelector('.typo-0.text-neutral-90')?.textContent.trim() || null;

                    const overall = card.querySelector('[data-testid="Overall Rating-rating"] span.sr2r3oj')?.textContent.trim() || null;
                    const easeOfUse = card.querySelector('[data-testid="Ease of Use-rating"] span.sr2r3oj')?.textContent.trim() || null;
                    const customerService = card.querySelector('[data-testid="Customer Service-rating"] span.sr2r3oj')?.textContent.trim() || null;
                    const features = card.querySelector('[data-testid="Features-rating"] span.sr2r3oj')?.textContent.trim() || null;
                    const valueForMoney = card.querySelector('[data-testid="Value for Money-rating"] span.sr2r3oj')?.textContent.trim() || null;
                    const likelihood = card.querySelector('[data-testid="Likelihood to Recommend-rating"]')?.textContent.trim() || null;

                    const description = card.querySelector('[data-testid="review-body"]')?.textContent.trim() || null;

                    return { name, role, industry, experience, title, date, overall, easeOfUse, customerService, features, valueForMoney, likelihood, description };
                })
            );

            allReviews.push(...reviews);

            await enqueueLinks({ selector: 'a.pagination__link--next', label: 'NEXT' });
        },
        failedRequestHandler({ request, log }) {
            log.error(`Request ${request.url} failed too many times.`);
        },
    });

    await crawler.run(startUrls);

    // Optional: save locally
    fs.writeFileSync('capterra_reviews.json', JSON.stringify(allReviews, null, 2));

    return allReviews;
}

module.exports = { scrapeCapterraReviews };
