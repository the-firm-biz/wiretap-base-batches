import http from 'http';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      console.log('Received webhook. Request details:');
      console.log('Headers:', JSON.stringify(req.headers, null, 2));

      try {
        const jsonData = JSON.parse(body);
        console.log('Parsed JSON data:');
        console.log(JSON.stringify(jsonData, null, 2));

        // Here you would process TokenCreated events from the data
        if (jsonData.data) {
          for (const block of jsonData.data) {
            for (const receipt of block.receipts || []) {
              for (const log of receipt.logs || []) {
                // Check if this is a TokenCreated event from your contract
                // Process accordingly
                console.log('Processing log:', log);
              }
            }
          }
        }
      } catch (error: any) {
        console.log('Error parsing JSON:', error.message);
        console.log('Raw body:', body);
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Webhook received');
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`QuickNode Streams webhook server running on port ${PORT}`);
});
