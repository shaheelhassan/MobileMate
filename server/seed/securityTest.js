// Quick local sanity-check for security controls:
// 1. Helmet headers present
// 2. Rate limiter triggers after rapid login attempts
// 3. NoSQL injection ($gt in body) is stripped by express-mongo-sanitize

const BASE = 'http://localhost:5000/api';

const log = (name, pass, detail = '') => {
  const symbol = pass ? 'PASS' : 'FAIL';
  console.log(`[${symbol}] ${name}${detail ? ` -> ${detail}` : ''}`);
};

const run = async () => {
  console.log('--- Running Backend Security Sanity Checks ---');

  // Check 1: Health endpoint responds & Helmet sets security headers
  try {
    const res = await fetch(`${BASE}/health`);
    const headers = Object.fromEntries(res.headers.entries());

    const hasXss = headers['x-content-type-options'] === 'nosniff';
    const hasFrameOptions = !!headers['x-frame-options'];
    const hidesPoweredBy = !headers['x-powered-by'];

    log('Helmet: X-Content-Type-Options: nosniff', hasXss);
    log('Helmet: X-Frame-Options set', hasFrameOptions);
    log('Helmet: X-Powered-By header stripped', hidesPoweredBy);
  } catch (err) {
    log('API reachable on port 5000', false, err.message);
    return;
  }

  // Check 2: NoSQL injection attempt on login
  try {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: { $gt: '' }, password: { $gt: '' } }),
    });
    // mongoSanitize strips keys starting with '$', so body becomes {} and controller returns 400 Bad Request
    const data = await res.json();
    const passed = res.status === 400 && data.message.includes('required');
    log('NoSQL injection stripped (email: { $gt: "" })', passed, `status: ${res.status}, msg: ${data.message}`);
  } catch (err) {
    log('NoSQL injection test', false, err.message);
  }

  // Check 3: Login rate limiting (10 max per 15 min)
  console.log('Testing login rate limiter (sending 12 rapid failed attempts)...');
  let rateLimited = false;
  for (let i = 1; i <= 12; i++) {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mobilemate.com', password: 'wrongpassword' }),
    });
    if (res.status === 429) {
      rateLimited = true;
      log(`Login rate limiter triggered on attempt #${i}`, true, 'HTTP 429 received');
      break;
    }
  }
  if (!rateLimited) {
    log('Login rate limiter triggered within 12 attempts', false, 'did not hit 429');
  }

  console.log('--- Checks complete ---');
};

run();
