# API Traffic Manager & Rate Limiting Service

A robust, modular, and extensible Express-based rate-limiting service using Redis. Supports dynamic strategy pattern configurations (Fixed Window Counter, Sliding Window Log) and per-user JWT authenticated limits (falling back to client IP for public requests).

---

## Prerequisites

Before running the application, make sure you have the following running locally or via Docker:

1. **Node.js** (v18+)
2. **Redis** (running on port `6379`)
3. **MongoDB** (running on port `27017`)

*Quick start with Docker:*
```bash
# Start Redis
docker run -d --name redis -p 6379:6379 redis

# Start MongoDB
docker run -d --name mongodb -p 27017:27017 mongo
```

---

## Installation & Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy environment config:
   ```bash
   cp .env.example .env
   ```
4. Start the application in development mode:
   ```bash
   npm run dev
   ```

---

## Running Tests

Run the native Node.js test runner commands within the `backend/` directory:

```bash
# Run all middleware and strategy tests
node tests/rateLimiter.test.js
node tests/fixedWindowStrategy.test.js
node tests/slidingWindowStrategy.test.js
node tests/auth.test.js
```

---

## Performance Benchmarking (k6)

We use **k6** to benchmark rate limit strategy throughput and behavior.

### 1. Install k6 CLI

Install `k6` on your system using one of the following methods:

- **Windows (winget):**
  ```powershell
  winget install k6
  ```
- **Windows (Chocolatey):**
  ```powershell
  choco install k6
  ```
- **Mac (Homebrew):**
  ```bash
  brew install k6
  ```
- **Other OS / Binaries:**
  Refer to the official [k6 installation guide](https://grafana.com/docs/k6/latest/set-up/install-k6/).

### 2. Execute Benchmarks

Make sure your backend server is running (`npm run dev` or `npm start` on `localhost:3000`). Then run the benchmarks:

- **Fixed Window Benchmark (`/test` route):**
  ```bash
  npm run benchmark:fixed
  ```
- **Sliding Window Benchmark (`/sliding-test` route):**
  ```bash
  npm run benchmark:sliding
  ```

### 3. Understanding the Results

When the load tests finish, k6 will display a summary report containing these key metrics:

- **`http_reqs` (Requests per second):** The overall rate of requests sent by k6.
- **`http_req_duration` (Average response time):** The average roundtrip time for requests.
- **`http_req_failed` (Error rate):** The percentage of network or database level request failures (excludes rate limit blocks).
- **`http_req_blocked_429` (Percentage of rate limited requests):** Custom metric showing the percentage of requests successfully intercepted and returned with an HTTP 429 status code.