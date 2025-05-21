import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the sample payload
const samplePayload = fs.readFileSync(
  path.join(__dirname, "sample-payload.json"),
  "utf8",
);

// Options for the HTTP request
const options = {
  hostname: "localhost",
  port: 3000,
  path: "/webhook",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(samplePayload),
  },
};

// Send the request
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

  res.setEncoding("utf8");
  res.on("data", (chunk) => {
    console.log(`RESPONSE: ${chunk}`);
  });
});

req.on("error", (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Write the payload data to the request
req.write(samplePayload);
req.end();

console.log("Test webhook request sent!");
