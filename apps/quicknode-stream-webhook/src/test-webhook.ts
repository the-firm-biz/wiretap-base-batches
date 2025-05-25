import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Use a simple test payload if the file doesn't exist
  let samplePayload;
  const samplePath = path.join(__dirname, 'sample-payload.json');

  if (fs.existsSync(samplePath)) {
    samplePayload = fs.readFileSync(samplePath, 'utf8');
    console.log('Using sample payload from file');
  } else {
    console.log('Sample payload file not found, using simple test payload');
    samplePayload = JSON.stringify({
      data: [
        {
          block: { number: '0x123456' },
          receipts: [
            {
              logs: [
                {
                  address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                  topics: [
                    '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
                  ],
                  data: '0x0000000000000000000000000000000000000000000000000000000000000000',
                },
              ],
            },
          ],
        },
      ],
    });
  }

  // Options for the HTTP request
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(samplePayload),
    },
  };

  console.log(
    `Sending request to http://${options.hostname}:${options.port}${options.path}`,
  );
  console.log(`Headers: ${JSON.stringify(options.headers, null, 2)}`);

  // Send the request
  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    res.setEncoding('utf8');
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`RESPONSE: ${data}`);
      console.log('Request completed successfully');
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    console.error(e.stack);
  });

  // Write the payload data to the request
  req.write(samplePayload);
  req.end();

  console.log('Test webhook request sent!');
} catch (error) {
  console.error('Error in test script:', error);
}
