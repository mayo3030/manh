#!/usr/bin/env node

/**
 * Manheim Scraper - Connection Test
 *
 * This script tests the connection to Bright Data Browser API
 * Run this first to verify your setup before running the full scraper
 */

const puppeteer = require('puppeteer-core');
const { HttpsProxyAgent } = require('https-proxy-agent');
const WebSocket = require('ws');
require('dotenv').config();

const BROWSER_WSS = process.env.BROWSER_WSS_ENDPOINT;
const PROXY_URL = process.env.HTTPS_PROXY || process.env.https_proxy;

console.log('🧪 Manheim Scraper - Connection Test');
console.log('=====================================\n');

// Test 1: Check environment variables
console.log('📋 Test 1: Checking configuration...');
console.log(`   BROWSER_WSS_ENDPOINT: ${BROWSER_WSS ? '✅ Set' : '❌ Missing'}`);
console.log(`   MANHEIM_USERNAME: ${process.env.MANHEIM_USERNAME ? '✅ Set' : '❌ Missing'}`);
console.log(`   MANHEIM_PASSWORD: ${process.env.MANHEIM_PASSWORD ? '✅ Set' : '❌ Missing'}`);
console.log(`   RESULTS_URL: ${process.env.RESULTS_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`   Proxy detected: ${PROXY_URL ? '⚠️  Yes (may cause issues)' : '✅ No'}`);
console.log('');

if (!BROWSER_WSS) {
  console.log('❌ Error: BROWSER_WSS_ENDPOINT not set in .env file');
  console.log('Please check your .env file and try again.');
  process.exit(1);
}

// Test 2: Test WebSocket connection
console.log('📋 Test 2: Testing Bright Data connection...');
console.log(`   Endpoint: ${BROWSER_WSS.replace(/:[^:@]+@/, ':****@')}`);
console.log('   Attempting connection...\n');

async function testConnection() {
  try {
    // Try direct connection (no proxy)
    console.log('   🔌 Trying direct connection...');
    const browser = await puppeteer.connect({
      browserWSEndpoint: BROWSER_WSS,
    });

    console.log('   ✅ Connected successfully!');

    // Test basic operations
    console.log('   📄 Creating new page...');
    const page = await browser.newPage();
    console.log('   ✅ Page created!');

    console.log('   🌐 Navigating to test page...');
    await page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('   ✅ Navigation successful!');

    const title = await page.title();
    console.log(`   📝 Page title: "${title}"`);

    await browser.disconnect();

    console.log('\n✅ All tests passed! Your setup is ready.');
    console.log('You can now run the full scraper with: npm start\n');
    process.exit(0);

  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}\n`);

    // Provide troubleshooting help
    console.log('🔧 Troubleshooting:');

    if (error.message.includes('403')) {
      console.log('   • 403 Forbidden - Bright Data rejected the connection');
      console.log('   • Check your credentials in .env file');
      console.log('   • Verify your Bright Data account has sufficient credits');
      console.log('   • Make sure you\'re not behind a corporate proxy');
      console.log('   • Try running on your local machine (not in a sandboxed environment)');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('EAI_AGAIN')) {
      console.log('   • DNS resolution failed');
      console.log('   • Check your internet connection');
      console.log('   • Try running on your local machine');
      console.log('   • If behind a corporate proxy, contact IT support');
    } else if (error.message.includes('timeout')) {
      console.log('   • Connection timeout');
      console.log('   • Check your internet connection');
      console.log('   • Bright Data servers might be slow, try again');
    } else if (error.message.includes('401')) {
      console.log('   • 401 Unauthorized - Invalid credentials');
      console.log('   • Double-check your BROWSER_WSS_ENDPOINT in .env');
      console.log('   • Verify the credentials match your Bright Data account');
    } else {
      console.log(`   • Unexpected error: ${error.message}`);
      console.log('   • Try running on your local machine');
      console.log('   • Check the full error above for details');
    }

    console.log('\n💡 Recommendation:');
    console.log('   This appears to be an environment issue, not a code issue.');
    console.log('   Please run this on your local machine to proceed.');
    console.log('   See RUNNING_LOCALLY.md for setup instructions.\n');

    process.exit(1);
  }
}

// Run the test
testConnection();
