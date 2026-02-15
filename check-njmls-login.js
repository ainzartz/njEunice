const rets = require('rets-client');

// Credentials from .env.local (simulated here for script simplicity or loaded via dotenv if available)
// But to be safe and quick, I will just read them from process.env if I run with `node -r dotenv/config`
// or I will parse the .env.local file manually since I can't rely on dotenv being installed.

const fs = require('fs');
const path = require('path');

function getEnv(key) {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(new RegExp(`${key}="(.*?)"`));
    if (match) return match[1];
  }
  return process.env[key];
}

const loginUrl = getEnv('NJMLS_RETS_URL');
const username = getEnv('NJMLS_USERNAME');
const password = getEnv('NJMLS_PASSWORD');

console.log(`Attempting to connect to ${loginUrl} with user ${username}...`);

rets.getAutoLogoutClient({
  loginUrl: loginUrl,
  username: username,
  password: password,
  version: 'RETS/1.8', // Try 1.8 first
  userAgent: 'RETS-Client/1.0', // Sometimes required
  method: 'GET' // Default is usually POST or GET depending on server. RETS default is often GET for login.
}).then(client => {
  console.log('==================================');
  console.log('LOGIN SUCCESSFUL!');
  console.log('==================================');

  // Try to get metadata resources to confirm read access
  return client.metadata.getResources()
    .then(resources => {
      console.log('Available Resources:');
      resources.results.forEach(r => console.log(` - ${r.ResourceID} (${r.StandardName})`));
    });
}).catch(err => {
  console.error('LOGIN FAILED:', err);
}).finally(() => {
  console.log('Done.');
});
