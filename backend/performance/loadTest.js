import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metric to track the percentage of HTTP 429 (Rate Limited) responses
const rateLimitRate = new Rate('http_req_blocked_429');

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp-up to 20 virtual users
    { duration: '20s', target: 20 }, // Maintain 20 virtual users
    { duration: '10s', target: 0 },  // Ramp-down to 0 virtual users
  ],
};

export default function () {
  // Read target path parameter from environments (defaults to 'test')
  const path = __ENV.PATH || 'test';
  const url = `http://localhost:3000/${path}`;

  const res = http.get(url);

  // Track if request was blocked under 429 Too Many Requests
  const is429 = res.status === 429;
  rateLimitRate.add(is429);

  // Validate response status
  check(res, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
  });

  // Pacing: Pause slightly between requests to simulate user behavior
  sleep(0.1);
}
