
# MERN Review App

This is a full-stack MERN application for scraping, storing, and viewing software reviews from multiple sources (G2, Capterra) using Apify actors and custom crawlers.

## Folder Structure
- `backend/` : Express API, Apify actor integration, custom scrapers
- `frontend/`: React app for searching and displaying reviews
- `pythoncode/`: (Optional) Python scrapper

## Quick Start

### 1. Backend Setup
1. Copy `.env.example` to `.env` and set your `APIFY_TOKEN` (for Apify integration).
2. Install dependencies:
	```shell
	cd backend
	npm install
	```
3. Start the backend server:
	```shell
	npm run dev
	# or
	node serverapify.js
	```
4. The backend runs at `http://localhost:3000` (default).

### 2. Frontend Setup
1. Install dependencies:
	```shell
	cd frontend
	npm install
	```
2. Start the React app:
	```shell
	npm start
	```
3. The frontend runs at `http://localhost:3000` (or another port if 3000 is in use).

## API Usage

### Fetch Reviews (Postman Example)
**Endpoint:**
```
GET http://localhost:3000/reviews?search=zoom&startDate=2023-01-01&endDate=2023-12-31
```
**Query Parameters:**
- `search`: Product name (e.g., "zoom", "stripe")
- `startDate`, `endDate`: (optional) Filter reviews by date


**Sample JSON Output:**
```json
[
	{
		"name": "Vikas P.",
		"title": "A must-use tool for modern payments",
		"date": "April 30, 2025",
		"rating": "5.0",
		"description": "A really easy way to accept payments online."
	},
	{
		"name": "Kostas S.",
		"title": "They just don't care",
		"date": "February 13, 2025",
		"rating": "2.0",
		"description": "Very bad support experience."
	},
	// ...more reviews
]
```

**Visual Output Reference:**

![Sample Output Screenshot](attachments/output-screenshot.png)

*See the screenshot above for how reviews are displayed in the app (JSON cards with color highlighting and pagination).* 

## Third Source Integration (Bonus)

- The backend integrates with an **Apify actor** to scrape reviews from G2 and Capterra dynamically.
- To use the third source, ensure your Apify token is set in `.env` and the actor is deployed on Apify.
- The API will trigger the actor, poll for results, and return reviews in JSON format.
- For custom scraping, see `backend/controller/scraper.js` and `backend/apifymain.js`.

## More Info
- See `backend/README.md` and `frontend/README.md` for advanced setup, environment variables, and troubleshooting.

---
**Contact:** For issues or questions, open an issue or contact the author.
