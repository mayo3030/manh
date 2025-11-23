const puppeteer = require('puppeteer-core');
const { HttpsProxyAgent } = require('https-proxy-agent');
const WebSocket = require('ws');
require('dotenv').config();

const BROWSER_WSS = process.env.BROWSER_WSS_ENDPOINT;
const USERNAME = process.env.MANHEIM_USERNAME;
const PASSWORD = process.env.MANHEIM_PASSWORD;
const AUTH_URL = process.env.AUTH_URL;
const RESULTS_URL = process.env.RESULTS_URL;
const VEHICLE_MAKES = process.env.VEHICLE_MAKES.split(',').map(m => m.trim().toLowerCase());

// Get proxy from environment
const PROXY_URL = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;

// Check if host should bypass proxy
function shouldBypassProxy(url) {
  const noProxy = process.env.NO_PROXY || process.env.no_proxy || '';
  if (!noProxy) return false;

  try {
    const urlObj = new URL(url.replace('wss://', 'https://'));
    const hostname = urlObj.hostname;

    const noProxyList = noProxy.split(',').map(h => h.trim());
    return noProxyList.some(pattern => {
      if (pattern === '*') return true;
      if (pattern.startsWith('*.')) {
        const domain = pattern.slice(2);
        return hostname.endsWith(domain) || hostname === domain;
      }
      return hostname === pattern;
    });
  } catch (e) {
    return false;
  }
}

async function connectWithRetry(maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`📡 Connection attempt ${i + 1}/${maxRetries}...`);

      let browser;
      const useProxy = PROXY_URL && !shouldBypassProxy(BROWSER_WSS);

      if (useProxy) {
        console.log(`🔌 Using proxy for WebSocket connection`);
        const agent = new HttpsProxyAgent(PROXY_URL);

        // Create custom WebSocket connection through proxy
        browser = await puppeteer.connect({
          browserWSEndpoint: BROWSER_WSS,
          // Provide custom WebSocket factory that uses the proxy agent
          transport: await createProxiedTransport(BROWSER_WSS, agent),
        });
      } else {
        console.log(`🔌 Direct connection (bypassing proxy)`);
        // Direct connection without proxy
        browser = await puppeteer.connect({
          browserWSEndpoint: BROWSER_WSS,
        });
      }

      console.log('✅ Connected to remote browser');
      return browser;
    } catch (error) {
      console.log(`❌ Connection attempt ${i + 1} failed: ${error.message}`);
      if (i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`⏳ Waiting ${waitTime / 1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw new Error(`Failed to connect after ${maxRetries} attempts: ${error.message}`);
      }
    }
  }
}

// Helper function to create WebSocket transport through proxy
async function createProxiedTransport(url, agent) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, {
      agent: agent,
      perMessageDeflate: false,
    });

    ws.on('open', () => {
      resolve({
        onmessage: null,
        onclose: null,
        send: (message) => ws.send(message),
        close: () => ws.close(),
      });

      ws.on('message', (data) => {
        if (resolve.onmessage) {
          resolve.onmessage.call(null, { data });
        }
      });

      ws.on('close', () => {
        if (resolve.onclose) {
          resolve.onclose.call(null);
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    ws.on('error', reject);
  });
}

async function scrapeManheim() {
  console.log('🚀 Starting Manheim scraper...');
  console.log('📡 Connecting to remote browser...');

  let browser;
  try {
    // Connect to remote browser with retry logic
    browser = await connectWithRetry();

    console.log('✅ Browser connection established');

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Enable request interception to monitor API calls
    await page.setRequestInterception(true);
    const apiResponses = [];

    page.on('request', request => {
      request.continue();
    });

    page.on('response', async response => {
      const url = response.url();
      // Capture API responses that might contain vehicle data
      if (url.includes('/api/') || url.includes('/search') || url.includes('vehicle')) {
        try {
          const contentType = response.headers()['content-type'];
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            apiResponses.push({ url, data });
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    console.log('🔐 Navigating to login page...');
    await page.goto(AUTH_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('⏳ Waiting for login form...');
    // Wait for login form to appear
    await page.waitForSelector('input[type="text"], input[name="username"], input[id="username"]', { timeout: 30000 });

    console.log('📝 Filling in credentials...');
    // Try different selectors for username field
    const usernameSelectors = [
      'input[name="username"]',
      'input[id="username"]',
      'input[type="text"]',
      'input[placeholder*="username" i]',
      'input[placeholder*="email" i]'
    ];

    let usernameField = null;
    for (const selector of usernameSelectors) {
      try {
        usernameField = await page.$(selector);
        if (usernameField) {
          console.log(`Found username field with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!usernameField) {
      throw new Error('Could not find username field');
    }

    await usernameField.type(USERNAME, { delay: 100 });

    // Try different selectors for password field
    const passwordSelectors = [
      'input[name="password"]',
      'input[id="password"]',
      'input[type="password"]'
    ];

    let passwordField = null;
    for (const selector of passwordSelectors) {
      try {
        passwordField = await page.$(selector);
        if (passwordField) {
          console.log(`Found password field with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!passwordField) {
      throw new Error('Could not find password field');
    }

    await passwordField.type(PASSWORD, { delay: 100 });

    console.log('🔘 Clicking login button...');
    // Find and click login button
    const loginButtonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:contains("Sign In")',
      'button:contains("Login")',
      'button:contains("Submit")',
      '.submit-button',
      '#submit-button'
    ];

    let loginSuccess = false;
    for (const selector of loginButtonSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          console.log(`Found login button with selector: ${selector}`);
          await button.click();
          loginSuccess = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!loginSuccess) {
      // Try clicking any button as fallback
      await page.click('button');
    }

    console.log('⏳ Waiting for authentication to complete...');
    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {
      console.log('Navigation timeout, continuing...');
    });

    console.log('🔍 Navigating to results page...');
    await page.goto(RESULTS_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('⏳ Waiting for vehicle data to load...');
    // Wait for content to load - adjust selectors based on actual page structure
    await page.waitForTimeout(5000); // Give time for dynamic content

    // Try to wait for vehicle listings
    try {
      await page.waitForSelector('[class*="vehicle"], [class*="listing"], [class*="result"], [class*="card"]', { timeout: 10000 });
    } catch (e) {
      console.log('Could not find vehicle listings with common selectors, continuing...');
    }

    console.log('📊 Extracting vehicle data...');

    // Extract data from the page
    const vehicles = await page.evaluate((makes) => {
      const results = [];

      // Try multiple strategies to find vehicle data

      // Strategy 1: Look for common vehicle listing elements
      const vehicleElements = document.querySelectorAll('[class*="vehicle"], [class*="listing"], [class*="result-item"], [class*="card"]');

      vehicleElements.forEach(element => {
        try {
          const text = element.innerText || element.textContent || '';
          const html = element.innerHTML;

          // Check if this is a Honda or Toyota
          const lowerText = text.toLowerCase();
          const isTargetMake = makes.some(make => lowerText.includes(make));

          if (isTargetMake) {
            // Extract various fields
            const vehicle = {
              text: text.trim(),
              html: html.substring(0, 500), // First 500 chars of HTML for debugging
            };

            // Try to extract specific fields
            const yearMatch = text.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) vehicle.year = yearMatch[0];

            const makeMatch = text.match(/\b(Honda|Toyota)\b/i);
            if (makeMatch) vehicle.make = makeMatch[0];

            // Try to find model
            const modelPatterns = [
              /(?:Honda|Toyota)\s+([A-Za-z0-9\-]+)/i,
              /\b(Accord|Civic|CR-V|Pilot|Camry|Corolla|RAV4|Highlander|Tacoma|Tundra)\b/i
            ];
            for (const pattern of modelPatterns) {
              const modelMatch = text.match(pattern);
              if (modelMatch) {
                vehicle.model = modelMatch[1] || modelMatch[0];
                break;
              }
            }

            // Try to find VIN
            const vinMatch = text.match(/\b[A-HJ-NPR-Z0-9]{17}\b/);
            if (vinMatch) vehicle.vin = vinMatch[0];

            // Try to find price
            const priceMatch = text.match(/\$[\d,]+/);
            if (priceMatch) vehicle.price = priceMatch[0];

            // Try to find mileage
            const mileageMatch = text.match(/([\d,]+)\s*mi/i);
            if (mileageMatch) vehicle.mileage = mileageMatch[1];

            results.push(vehicle);
          }
        } catch (e) {
          console.error('Error extracting vehicle data:', e);
        }
      });

      // Strategy 2: Look in the entire page body if no results found
      if (results.length === 0) {
        const bodyText = document.body.innerText;
        makes.forEach(make => {
          if (bodyText.toLowerCase().includes(make)) {
            results.push({
              note: `Found ${make} mentioned in page`,
              pageText: bodyText.substring(0, 1000) // First 1000 chars
            });
          }
        });
      }

      return results;
    }, VEHICLE_MAKES);

    console.log(`✅ Found ${vehicles.length} vehicles matching criteria`);

    // Save API responses that might contain vehicle data
    console.log(`📡 Captured ${apiResponses.length} API responses`);

    // Combine all data
    const allData = {
      scrapedAt: new Date().toISOString(),
      targetMakes: VEHICLE_MAKES,
      vehiclesFromDOM: vehicles,
      apiResponses: apiResponses.length > 0 ? apiResponses : 'No API responses captured',
      pageUrl: page.url(),
    };

    // Take a screenshot for debugging
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'manheim-results.png', fullPage: true });

    // Save the page HTML for analysis
    const html = await page.content();
    const fs = require('fs');
    fs.writeFileSync('page.html', html);
    console.log('💾 Saved page HTML to page.html');

    // Save results
    fs.writeFileSync('vehicles.json', JSON.stringify(allData, null, 2));
    console.log('💾 Saved results to vehicles.json');

    // Print summary
    console.log('\n📋 Summary:');
    console.log(`   - Vehicles found: ${vehicles.length}`);
    console.log(`   - API responses captured: ${apiResponses.length}`);
    console.log(`   - Final URL: ${page.url()}`);
    console.log(`   - Screenshot saved: manheim-results.png`);

    if (vehicles.length > 0) {
      console.log('\n🚗 Sample vehicles:');
      vehicles.slice(0, 3).forEach((v, i) => {
        console.log(`\n   Vehicle ${i + 1}:`);
        console.log(`   - Make: ${v.make || 'N/A'}`);
        console.log(`   - Model: ${v.model || 'N/A'}`);
        console.log(`   - Year: ${v.year || 'N/A'}`);
        console.log(`   - Price: ${v.price || 'N/A'}`);
        console.log(`   - VIN: ${v.vin || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error during scraping:', error);
    throw error;
  } finally {
    if (browser) {
      console.log('\n🔚 Closing browser...');
      await browser.disconnect();
    }
  }
}

// Run the scraper
scrapeManheim()
  .then(() => {
    console.log('\n✅ Scraping completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Scraping failed:', error);
    process.exit(1);
  });
