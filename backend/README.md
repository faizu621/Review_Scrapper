# MERN Review App (Backend)

## Setup
1. Copy `.env.example` to `.env` and set `MONGO_URI`.
2. Install dependencies:
   ```
   cd backend
   npm install
   ```
3. Run server:
   ```
   npm run dev
   ```
4. API endpoints:
   - `POST /api/reviews` -> create review (JSON body)
   - `GET /api/reviews?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&source=G2` -> list reviews
