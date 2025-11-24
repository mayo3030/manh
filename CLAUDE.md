# CLAUDE.md - AI Assistant Guide

This document provides comprehensive guidance for AI assistants working with the Manheim Auction Scraper codebase.

## Table of Contents

- [Project Overview](#project-overview)
- [Repository Structure](#repository-structure)
- [Core Architecture](#core-architecture)
- [Development Workflows](#development-workflows)
- [Key Conventions](#key-conventions)
- [Environment & Configuration](#environment--configuration)
- [Testing & Debugging](#testing--debugging)
- [Git Workflow](#git-workflow)
- [Security Considerations](#security-considerations)
- [Common Tasks](#common-tasks)
- [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## Project Overview

**Type**: Web scraper
**Purpose**: Extract Honda and Toyota vehicle listings from Manheim auction site
**Stack**: Node.js, Puppeteer, Bright Data Browser API
**Status**: Production-ready, requires local environment to run

### Key Features
- OAuth authentication handling
- Remote browser automation via Bright Data
- Vehicle data extraction (make, model, year, price, VIN, mileage)
- API response interception
- Screenshot and HTML capture for debugging
- Configurable vehicle filters

### Known Limitations
- Cannot run in sandboxed environments due to proxy restrictions
- Requires Bright Data account with Browser API access
- Requires valid Manheim credentials
- Subject to website structure changes (selectors may need updates)

---

## Repository Structure

```
manh/
├── scraper.js              # Main scraper implementation (419 lines)
├── test-connection.js      # Connection test utility (111 lines)
├── run-local.sh            # Local execution helper script
├── package.json            # Dependencies and npm scripts
├── .env                    # Environment variables (gitignored, DO NOT COMMIT)
├── .env.example            # Template for environment configuration
├── .gitignore              # Git ignore rules
├── README.md               # User-facing documentation
├── QUICKSTART.md           # Quick setup guide
├── RUNNING_LOCALLY.md      # Local setup instructions
└── CLAUDE.md               # This file - AI assistant guide

Generated files (gitignored):
├── vehicles.json           # Scraped vehicle data output
├── page.html               # Full page HTML for debugging
├── manheim-results.png     # Screenshot of results page
└── node_modules/           # Installed dependencies
```

### File Purposes

| File | Lines | Purpose | When to Modify |
|------|-------|---------|----------------|
| `scraper.js` | 419 | Main scraper logic | When selectors change, adding features, fixing bugs |
| `test-connection.js` | 111 | Test Bright Data connection | Rarely (only for connection troubleshooting improvements) |
| `run-local.sh` | 57 | Local setup automation | When adding new setup steps |
| `package.json` | 28 | Dependencies and scripts | When adding new dependencies or scripts |
| `.env.example` | 14 | Config template | When adding new environment variables |

---

## Core Architecture

### Technology Stack

```javascript
// Core dependencies (package.json:19-26)
{
  "puppeteer-core": "^21.6.1",      // Browser automation (headless Chrome)
  "dotenv": "^16.3.1",              // Environment variable management
  "ws": "^8.18.3",                   // WebSocket for browser connection
  "https-proxy-agent": "^7.0.6",    // Proxy support
  "socks-proxy-agent": "^8.0.5",    // SOCKS proxy support
  "global-agent": "^3.0.0"          // Global proxy configuration
}
```

### Main Workflow (scraper.js)

1. **Connection** (lines 39-78): Connect to remote browser via Bright Data
   - Retry logic with exponential backoff (2s, 4s, 8s, 16s, 32s)
   - Proxy detection and bypass logic
   - WebSocket transport creation

2. **Authentication** (lines 155-253): OAuth login flow
   - Navigate to OAuth page
   - Fill username/password with multiple selector strategies
   - Submit login form
   - Wait for redirect

3. **Navigation** (lines 255-267): Go to search results
   - Load results page
   - Wait for dynamic content (5s + selector wait)

4. **Data Extraction** (lines 269-349): Extract vehicle data
   - DOM scraping with multiple strategies
   - API response interception
   - Regex-based field extraction (year, make, model, VIN, price, mileage)

5. **Output** (lines 357-397): Save results
   - JSON file with structured data
   - Screenshot (full page)
   - HTML source

### Key Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `connectWithRetry()` | scraper.js:39-78 | Connect to browser with retry logic |
| `createProxiedTransport()` | scraper.js:81-115 | Create WebSocket with proxy support |
| `shouldBypassProxy()` | scraper.js:17-37 | Check NO_PROXY environment variable |
| `scrapeManheim()` | scraper.js:117-407 | Main scraper orchestration |

### Selector Strategies

The scraper uses **multiple fallback selectors** to handle website changes:

```javascript
// Username field selectors (lines 164-170)
const usernameSelectors = [
  'input[name="username"]',
  'input[id="username"]',
  'input[type="text"]',
  'input[placeholder*="username" i]',
  'input[placeholder*="email" i]'
];

// Vehicle listing selectors (line 278)
const vehicleElements = document.querySelectorAll(
  '[class*="vehicle"], [class*="listing"], [class*="result-item"], [class*="card"]'
);
```

This approach makes the scraper **resilient to minor HTML changes**.

---

## Development Workflows

### Initial Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd manh

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 4. Test connection
npm test

# 5. Run scraper
npm start
```

### Available Scripts

```json
{
  "start": "node scraper.js",      // Run the scraper
  "test": "node test-connection.js", // Test Bright Data connection
  "scrape": "node scraper.js"       // Alias for start
}
```

### Typical Development Cycle

1. **Make changes** to `scraper.js`
2. **Test connection** first: `npm test`
3. **Run full scrape**: `npm start`
4. **Check outputs**:
   - `vehicles.json` - Verify data structure
   - `manheim-results.png` - Inspect what loaded
   - `page.html` - Debug selectors
5. **Iterate** based on results

### Testing Connection Issues

Use `test-connection.js` (not the full scraper) to debug connection problems:

```bash
npm test
```

This tests:
- Environment variable configuration
- Bright Data WebSocket connection
- Basic browser operations (new page, navigation)

---

## Key Conventions

### Code Style

- **Logging**: Use emoji prefixes for visual clarity
  - 🚀 Starting/initialization
  - ✅ Success/completion
  - ❌ Errors/failures
  - 📡 Network operations
  - 📸 Screenshots
  - 💾 File operations
  - 🔐 Authentication
  - 🔍 Navigation
  - ⏳ Waiting/delays

- **Error Handling**: Always wrap async operations in try-catch
- **Timeouts**: Explicit timeouts for all network operations
- **Selectors**: Always use arrays of fallback selectors

### Variable Naming

```javascript
// Environment variables: SCREAMING_SNAKE_CASE
const BROWSER_WSS = process.env.BROWSER_WSS_ENDPOINT;

// Constants: SCREAMING_SNAKE_CASE
const VEHICLE_MAKES = ['honda', 'toyota'];

// Functions: camelCase
async function scrapeManheim() { }

// Local variables: camelCase
const vehicleElements = document.querySelectorAll(...);
```

### Regex Patterns

The scraper uses regex for flexible data extraction:

```javascript
// Year: 4-digit starting with 19 or 20
const yearMatch = text.match(/\b(19|20)\d{2}\b/);

// VIN: 17 alphanumeric characters (excluding I, O, Q)
const vinMatch = text.match(/\b[A-HJ-NPR-Z0-9]{17}\b/);

// Price: Dollar sign + digits with optional commas
const priceMatch = text.match(/\$[\d,]+/);

// Mileage: Digits + "mi" (case insensitive)
const mileageMatch = text.match(/([\d,]+)\s*mi/i);
```

### Timeout Values

```javascript
60000  // 60s - Page navigation (OAuth, results)
30000  // 30s - Login form appearance
10000  // 10s - Vehicle listings wait
5000   // 5s  - General dynamic content wait
```

---

## Environment & Configuration

### Required Environment Variables

```env
# Authentication
MANHEIM_USERNAME=<your_username>
MANHEIM_PASSWORD=<your_password>

# Browser API
BROWSER_WSS_ENDPOINT=wss://brd-customer-hl_XXXXX-zone-XXXXX:password@brd.superproxy.io:9222

# Target URLs
AUTH_URL=https://auth.manheim.com/as/authorization.oauth2?...
RESULTS_URL=https://search.manheim.com/results#/results/<search-id>

# Filters
VEHICLE_MAKES=Honda,Toyota
```

### Optional Environment Variables

```env
# Proxy configuration (auto-detected)
HTTPS_PROXY=http://proxy.example.com:8080
NO_PROXY=localhost,127.0.0.1,brd.superproxy.io
```

### Configuration Rules

1. **NEVER commit `.env`** - Contains sensitive credentials
2. **Always update `.env.example`** when adding new variables
3. **Use `.env.example` as template** for local setup
4. **Sanitize credentials in logs** (see test-connection.js:38)

---

## Testing & Debugging

### Debug Outputs

The scraper generates three debug files:

1. **vehicles.json** - Structured data for analysis
   ```json
   {
     "scrapedAt": "2025-11-23T12:00:00.000Z",
     "targetMakes": ["honda", "toyota"],
     "vehiclesFromDOM": [...],
     "apiResponses": [...],
     "pageUrl": "https://..."
   }
   ```

2. **manheim-results.png** - Full-page screenshot
   - Check what actually loaded
   - Verify login succeeded
   - Inspect page structure

3. **page.html** - Complete HTML source
   - Find correct selectors
   - Understand page structure
   - Debug why selectors failed

### Common Issues & Solutions

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| "403 Forbidden" | Bright Data rejected connection | Check credentials, credits, zone name |
| "ENOTFOUND" | DNS resolution failed | Check internet, try local machine |
| No vehicles found | Selectors outdated | Check page.html, update selectors |
| Login failed | CAPTCHA or wrong credentials | Check screenshot, verify credentials |
| Timeout | Page too slow | Increase timeout values |

### Debugging Selectors

When selectors fail:

1. **Check page.html** for current structure
2. **Inspect screenshot** to see what loaded
3. **Use browser DevTools** on the actual site
4. **Add new selectors** to fallback arrays
5. **Test incrementally** with small changes

Example:
```javascript
// If existing selectors fail, add new ones
const vehicleSelectors = [
  '[class*="vehicle"]',     // Existing
  '[class*="listing"]',     // Existing
  '[data-testid="vehicle"]', // NEW
  '.auction-item'           // NEW
];
```

---

## Git Workflow

### Branch Naming

Current convention:
```
claude/<session-id>-<unique-id>
```

Example: `claude/claude-md-micdq3cr2v8m2rs7-01BHfEzQFKKZ5qyDcTWid8r8`

### Commit Message Style

Based on recent commits:
```
<verb> <concise description>

Examples:
- Add connection test script for local debugging
- Update scraper with improved proxy handling and local setup docs
- Add Manheim auction scraper for Honda and Toyota vehicles
```

**Conventions:**
- Use imperative mood ("Add" not "Added")
- Be concise (50-70 characters)
- Focus on "what" and "why"
- No period at end

### Git Commands

```bash
# Push with retry logic (network failures)
git push -u origin <branch-name>
# If fails, retry up to 4 times with backoff: 2s, 4s, 8s, 16s

# Fetch specific branch
git fetch origin <branch-name>

# Pull with retry
git pull origin <branch-name>
```

---

## Security Considerations

### Critical Rules

1. **NEVER commit `.env`** ✅ Already in .gitignore
2. **NEVER log full credentials** - Sanitize in output
3. **NEVER commit secrets** in code - Use environment variables
4. **NEVER push to public repos** without sanitizing

### Gitignored Sensitive Files

```gitignore
.env
.env.local
.env.*.local
vehicles.json          # May contain sensitive data
page.html              # May contain session tokens
*.png                  # Screenshots may show credentials
```

### Credential Handling

```javascript
// ✅ GOOD - Sanitize credentials in logs
console.log(`Endpoint: ${BROWSER_WSS.replace(/:[^:@]+@/, ':****@')}`);

// ❌ BAD - Don't log raw credentials
console.log(`Endpoint: ${BROWSER_WSS}`);
```

### Web Scraping Compliance

- Respect robots.txt
- Follow Manheim's Terms of Service
- Rate limit requests (not applicable here - single run)
- For educational purposes only

---

## Common Tasks

### Add New Vehicle Make

```env
# .env
VEHICLE_MAKES=Honda,Toyota,Ford,Chevrolet,Nissan
```

The scraper automatically processes all makes in the list.

### Change Search URL

```env
# .env
RESULTS_URL=https://search.manheim.com/results#/results/<new-search-id>
```

### Update Selectors (Website Changed)

1. **Run scraper** to get current output
2. **Check `page.html`** for new structure
3. **Update selector arrays** in scraper.js:
   ```javascript
   // Line ~164 - Username field
   const usernameSelectors = [/* add new selectors */];

   // Line ~192 - Password field
   const passwordSelectors = [/* add new selectors */];

   // Line ~278 - Vehicle listings
   const vehicleElements = document.querySelectorAll('/* new selector */');
   ```
4. **Test changes** with `npm start`
5. **Verify output** in vehicles.json

### Add New Data Field

To extract a new field (e.g., color):

```javascript
// In scraper.js:~290, add to vehicle object:
const vehicle = {
  text: text.trim(),
  html: html.substring(0, 500),
  year: ...,
  make: ...,
  model: ...,
  color: extractColor(text)  // NEW
};

// Add extraction logic:
function extractColor(text) {
  const colorMatch = text.match(/\b(Black|White|Silver|Red|Blue|Gray)\b/i);
  return colorMatch ? colorMatch[0] : null;
}
```

### Increase Timeouts

```javascript
// scraper.js:156 - Navigation timeout
await page.goto(AUTH_URL, { waitUntil: 'networkidle2', timeout: 90000 }); // Changed from 60000

// scraper.js:260 - Dynamic content wait
await page.waitForTimeout(10000); // Changed from 5000
```

---

## AI Assistant Guidelines

### Before Making Changes

1. **Read the code first** - Never propose changes to unread code
2. **Check recent commits** - Understand current state
3. **Review debug outputs** - Look at vehicles.json, page.html, screenshots
4. **Test connection first** - Run `npm test` before `npm start`

### When Modifying Scraper Logic

1. **Preserve retry logic** - Connection retry is critical
2. **Maintain selector arrays** - Don't remove fallback selectors
3. **Keep timeout values** - Don't reduce timeouts arbitrarily
4. **Preserve emoji logging** - Maintains consistent UX
5. **Test incrementally** - Small changes, frequent testing

### When Debugging

1. **Check debug files first** (vehicles.json, page.html, screenshot)
2. **Don't assume selectors** - Always verify with page.html
3. **Consider environment** - Many issues are environment-related
4. **Read error messages carefully** - They often indicate the exact issue
5. **Use test-connection.js** - Isolate connection vs. scraping issues

### Code Modification Checklist

Before making changes, verify:
- [ ] Read existing code in affected areas
- [ ] Understand current selector strategy
- [ ] Have example of target data/page
- [ ] Know which debug files to check
- [ ] Understand error handling flow
- [ ] Won't break retry logic
- [ ] Won't expose credentials in logs

### Documentation Updates

When changing code, also update:
- [ ] Inline comments if logic changes
- [ ] README.md if user-facing features change
- [ ] .env.example if new variables added
- [ ] This CLAUDE.md if architecture changes

### Testing Requirements

Before committing changes:
- [ ] Test connection: `npm test`
- [ ] Test full scrape: `npm start`
- [ ] Verify vehicles.json has expected data
- [ ] Check screenshot shows correct page
- [ ] Ensure no credentials leaked in logs
- [ ] Confirm error messages are clear

### Common Pitfalls to Avoid

1. **Don't remove error handling** - It's there for a reason
2. **Don't hardcode values** - Use environment variables
3. **Don't reduce timeouts** - Manheim pages can be slow
4. **Don't simplify selectors** - Fallbacks handle site changes
5. **Don't commit .env** - Already gitignored, but double-check
6. **Don't over-engineer** - Keep it simple and focused
7. **Don't break retry logic** - Connection issues are common

### When to Ask User

Ask the user when:
- Credentials might be wrong (don't guess)
- Need to test on actual Manheim site (can't simulate)
- Selector strategy unclear from page.html
- Uncertain if feature is needed
- Breaking change would be required

### Environment-Specific Notes

- **Sandboxed environments**: Will fail due to proxy restrictions
- **Local machine**: Should work with proper credentials
- **Corporate networks**: May need proxy configuration
- **Bright Data**: Requires active account with credits

---

## Quick Reference

### File Locations

| Need | File | Line |
|------|------|------|
| Connection retry | scraper.js | 39-78 |
| Login selectors | scraper.js | 164-227 |
| Vehicle extraction | scraper.js | 272-349 |
| Output saving | scraper.js | 357-397 |
| Environment config | .env.example | 1-14 |
| Connection test | test-connection.js | 41-107 |

### Key Constants

```javascript
BROWSER_WSS           // Bright Data endpoint
USERNAME/PASSWORD     // Manheim credentials
AUTH_URL             // OAuth login page
RESULTS_URL          // Search results page
VEHICLE_MAKES        // Target makes (array)
```

### Output Files

```
vehicles.json        // Main output (JSON)
manheim-results.png  // Screenshot (PNG)
page.html           // Source (HTML)
```

---

## Version History

- **Current**: v1.0.0 - Production-ready Manheim scraper
- **Last Updated**: 2025-11-23
- **Last Commits**:
  - `6dd2926` - Add connection test script
  - `adb3af9` - Update scraper with proxy handling
  - `7fc68a4` - Add Manheim auction scraper

---

## Additional Resources

- [Puppeteer Docs](https://pptr.dev/)
- [Bright Data Browser API](https://docs.brightdata.com/scraping-automation/browser-api/overview)
- [Manheim](https://www.manheim.com/)
- [README.md](./README.md) - User documentation
- [RUNNING_LOCALLY.md](./RUNNING_LOCALLY.md) - Local setup guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide

---

**Last Updated**: 2025-11-23
**Maintained by**: AI-assisted development
**Status**: ✅ Active, production-ready
