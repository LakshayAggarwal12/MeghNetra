/**
 * Authentication & Authorization Integration Tests for MEGHNETRA
 */
const axios = require("axios");
const express = require("express");
const pool = require("../src/config/db");
const authRoutes = require("../src/routes/auth.routes");
const adminRoutes = require("../src/routes/admin.routes");

async function runTests() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);

  const server = app.listen(0);
  const port = server.address().port;
  const baseURL = `http://localhost:${port}/api`;
  console.log(`[TEST] Server running on port ${port}`);

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      testPassed++;
    } else {
      console.error(`  ✗ ${message}`);
      testFailed++;
    }
  }

  const testEmail = `testuser_${Date.now()}@meghnetra.test`;

  try {
    // 1. Validation error on missing fields
    try {
      await axios.post(`${baseURL}/auth/register`, { name: "", email: "" });
      assert(false, "Should reject empty fields");
    } catch (err) {
      assert(err.response?.status === 400, "Rejects empty registration with 400");
    }

    // 2. Validation error on short password
    try {
      await axios.post(`${baseURL}/auth/register`, {
        name: "Test",
        email: testEmail,
        password: "short",
      });
      assert(false, "Should reject short password");
    } catch (err) {
      assert(err.response?.status === 400, "Rejects password < 8 chars with 400");
    }

    // 3. Register citizen
    const regRes = await axios.post(`${baseURL}/auth/register`, {
      name: "Aarav Gupta",
      email: testEmail,
      password: "SecurePassword123!",
    });
    assert(regRes.status === 201 && regRes.data.token && regRes.data.user.role === "citizen", "Registers new citizen with 201 and JWT token");
    const citizenToken = regRes.data.token;

    // 4. Reject duplicate email
    try {
      await axios.post(`${baseURL}/auth/register`, {
        name: "Duplicate Aarav",
        email: testEmail,
        password: "SecurePassword123!",
      });
      assert(false, "Should reject duplicate email");
    } catch (err) {
      assert(err.response?.status === 409, "Rejects duplicate registration with 409 Conflict");
    }

    // 5. Citizen login
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: testEmail,
      password: "SecurePassword123!",
    });
    assert(loginRes.status === 200 && loginRes.data.token, "Logs in citizen with 200");

    // 6. Admin login
    const adminLoginRes = await axios.post(`${baseURL}/auth/login`, {
      email: "admin@meghnetra.in",
      password: "admin123",
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.data.user.role === "admin", "Logs in seeded admin with 200");
    const adminToken = adminLoginRes.data.token;

    // 7. GET /api/auth/me (authenticated session check)
    const meRes = await axios.get(`${baseURL}/auth/me`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    assert(meRes.status === 200 && meRes.data.user.email === testEmail, "GET /api/auth/me validates session and returns user profile");

    // 8. Authorization check: Citizen cannot access admin endpoint
    try {
      await axios.get(`${baseURL}/admin/queue`, {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      assert(false, "Citizen should be forbidden from admin routes");
    } catch (err) {
      assert(err.response?.status === 403, "Citizen blocked from admin endpoint with 403 Forbidden");
    }

    // 9. Authorization check: Admin can access admin endpoint
    const adminQueueRes = await axios.get(`${baseURL}/admin/queue`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminQueueRes.status === 200 && Array.isArray(adminQueueRes.data.queue), "Admin allowed access to admin queue with 200");

    // 10. Logout and token invalidation
    const logoutRes = await axios.post(
      `${baseURL}/auth/logout`,
      {},
      { headers: { Authorization: `Bearer ${citizenToken}` } }
    );
    assert(logoutRes.status === 200, "Logs out user with 200");

    // 11. Revoked token cannot access protected routes
    try {
      await axios.get(`${baseURL}/auth/me`, {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      assert(false, "Revoked token should be rejected");
    } catch (err) {
      assert(err.response?.status === 401, "Revoked token rejected with 401 Unauthorized");
    }

    // Clean up created user
    await pool.query("DELETE FROM users WHERE email = $1", [testEmail]);
    console.log(`  ✓ Cleaned up test user ${testEmail}`);
  } catch (err) {
    console.error("Test execution failed:", err);
    testFailed++;
  } finally {
    server.close();
    await pool.end();
    console.log(`\n========================================`);
    console.log(`Test Results: ${testPassed} Passed, ${testFailed} Failed`);
    console.log(`========================================`);
    process.exit(testFailed > 0 ? 1 : 0);
  }
}

runTests();
