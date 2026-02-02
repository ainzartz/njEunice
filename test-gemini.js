const https = require('https');

const API_KEY = process.argv[2];

if (!API_KEY) {
  console.error("Please provide your API KEY as an argument.");
  process.exit(1);
}

function testModelGeneration(modelName) {
  return new Promise((resolve) => {
    console.log(`Testing generation with model: ${modelName}...`);

    const data = JSON.stringify({
      contents: [{
        parts: [{ text: "Hello, just say 'Success'" }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`\u2705 SUCCESS: ${modelName} works!`);
        } else {
          let errorMessage = res.statusMessage;
          try {
            const json = JSON.parse(responseBody);
            if (json.error && json.error.message) {
              errorMessage = json.error.message;
            }
          } catch (e) { }
          console.log(`\u274C FAILED: ${modelName} - ${errorMessage}`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`\u274C ERROR: ${modelName} - ${error.message}`);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("Checking stable/latest aliases from your list...\n");

  // These showed up in your list and usually have Free Tier
  await testModelGeneration("gemini-pro-latest");
  await testModelGeneration("gemini-flash-latest");
}

runTests();
