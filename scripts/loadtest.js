const autocannon = require("autocannon");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

console.log("=".repeat(60));
console.log("LOAD TEST — Single Server Scenario");
console.log("=".repeat(60));
console.log(`Target: ${BASE_URL}/feed`);
console.log("Connections: 100 concurrent users");
console.log("Duration: 30 seconds");
console.log("=".repeat(60));
console.log("");

const instance = autocannon(
  {
    url: `${BASE_URL}/feed`,
    connections: 100,
    duration: 30,
    timeout: 5,
  },
  (err, results) => {
    if (err) {
      console.error(err);
      return;
    }

    const total = results.requests.total;
    const non2xx = results["non2xx"] || 0;
    const successRate = total > 0 ? (((total - non2xx) / total) * 100).toFixed(1) : 0;

    console.log("");
    console.log("=".repeat(60));
    console.log("RESULTS");
    console.log("=".repeat(60));
    console.log(`Requests completed:  ${total}`);
    console.log(`Successful (2xx):    ${total - non2xx}`);
    console.log(`Failed (non-2xx):    ${non2xx}`);
    console.log(`Success rate:        ${successRate}%`);
    console.log(`Timeouts:            ${results.timeouts}`);
    console.log("");
    console.log("Response times:");
    console.log(`  Average:  ${results.latency.average}ms`);
    console.log(`  p50:      ${results.latency.p50}ms`);
    console.log(`  p99:      ${results.latency.p99}ms`);
    console.log(`  Max:      ${results.latency.max}ms`);
    console.log("");

    if (non2xx > total * 0.1 || results.latency.p99 > 2000) {
      console.log("🔴 The system is failing under this load.");
      console.log(`   ${non2xx} out of ${total} requests failed.`);
      console.log("   Open server.js and find out why.");
    } else if (non2xx > 0 || results.latency.p99 > 500) {
      console.log("🟡 Degrading under load. Some requests failing.");
    } else {
      console.log("🟢 Looking good! The fixes are working.");
    }
  },
);

autocannon.track(instance, { renderProgressBar: true });
