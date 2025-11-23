# Quick Start Guide

## 🎯 Goal
Scrape Honda and Toyota vehicle listings from Manheim auction site.

## 🚀 Run on Your Local Machine

### Step 1: Prerequisites
- Install [Node.js](https://nodejs.org/) (v14+)
- Have your Bright Data and Manheim credentials ready

### Step 2: Setup
```bash
# Navigate to project directory
cd manh

# Install dependencies
npm install
```

### Step 3: Run
```bash
# Option A: Using npm
npm start

# Option B: Using the helper script (Linux/Mac)
./run-local.sh

# Option C: Using Node directly
node scraper.js
```

### Step 4: Check Results
```bash
# View scraped data
cat vehicles.json

# Open screenshot
open manheim-results.png  # Mac
xdg-open manheim-results.png  # Linux
start manheim-results.png  # Windows
```

## 📊 Output Files

| File | Description |
|------|-------------|
| `vehicles.json` | Extracted vehicle data (make, model, year, price, VIN, mileage) |
| `manheim-results.png` | Screenshot of the results page |
| `page.html` | Full HTML source for debugging |

## ⚙️ Configuration

All settings are in the `.env` file:

```env
# Already configured with your credentials
MANHEIM_USERNAME=mina2020
MANHEIM_PASSWORD=Mayomina07002
BROWSER_WSS_ENDPOINT=wss://brd-customer-hl_4e6b8d69-zone-manh:6cep068ozetm@brd.superproxy.io:9222

# Customize these if needed
VEHICLE_MAKES=Honda,Toyota          # Add more: Honda,Toyota,Ford,Nissan
RESULTS_URL=https://search.manheim.com/results#/results/9289f2a7-061c-4bcf-8ace-d9e60b2c5e5d
```

## ❓ Troubleshooting

### Can't connect to browser
✅ **Check**: Bright Data credentials and account credits

### No vehicles found
✅ **Check**: `page.html` to see what loaded - selectors may need adjustment

### Login fails
✅ **Check**: Manheim credentials and look for CAPTCHA in screenshot

## 📖 More Info

- **Detailed Setup**: See [RUNNING_LOCALLY.md](./RUNNING_LOCALLY.md)
- **Full Documentation**: See [README.md](./README.md)

---

**Current Status**: ✅ **Ready to run locally** (cannot run in sandboxed environment due to proxy restrictions)
