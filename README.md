# Manheim Auction Scraper

A web scraper for extracting Honda and Toyota vehicle listings from Manheim auction site using Puppeteer and remote browser automation.

> ⚠️ **Note**: This scraper requires a local environment to run. See [RUNNING_LOCALLY.md](./RUNNING_LOCALLY.md) for detailed setup instructions.

## Features

- 🔐 OAuth authentication handling
- 🌐 Remote browser support via Bright Data
- 🚗 Filters for Honda and Toyota vehicles
- 📊 Extracts vehicle details (make, model, year, price, VIN, mileage)
- 💾 Saves results to JSON
- 📸 Captures screenshots for debugging
- 📡 Intercepts API calls to capture additional data

## Prerequisites

- Node.js (v14 or higher)
- Bright Data account with Browser API access
- Valid Manheim auction credentials

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (see Configuration section)

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Manheim Credentials
MANHEIM_USERNAME=your_username
MANHEIM_PASSWORD=your_password

# Bright Data Browser API
BROWSER_WSS_ENDPOINT=wss://brd-customer-hl_4e6b8d69-zone-acv:your_password@brd.superproxy.io:9222

# Target URLs
AUTH_URL=https://auth.manheim.com/as/authorization.oauth2?response_type=code&state=%2Fresults&scope=email+profile+openid+offline_access&adaptor=manheim_customer&client_id=25xk9b3322exa7ar4tdazrr4&redirect_uri=https%3A%2F%2Fsearch.manheim.com%2Fcallback#/?filters=VehicleSubTypes:00000000-0000-1000-0000-000100000001
RESULTS_URL=https://search.manheim.com/results#/results/your_search_id

# Vehicle filters
VEHICLE_MAKES=Honda,Toyota
```

**Note:** The `.env` file is gitignored to protect your credentials.

## Usage

Run the scraper:

```bash
npm start
```

or

```bash
node scraper.js
```

## Output

The scraper generates the following files:

- `vehicles.json` - Extracted vehicle data in JSON format
- `page.html` - Full HTML of the results page for debugging
- `manheim-results.png` - Screenshot of the results page

### Sample Output Structure

```json
{
  "scrapedAt": "2025-11-23T12:00:00.000Z",
  "targetMakes": ["honda", "toyota"],
  "vehiclesFromDOM": [
    {
      "make": "Honda",
      "model": "Accord",
      "year": "2022",
      "price": "$25,000",
      "vin": "1HGCV1F30JA123456",
      "mileage": "15,000"
    }
  ],
  "apiResponses": [...],
  "pageUrl": "https://search.manheim.com/results#/..."
}
```

## How It Works

1. **Connection**: Connects to remote browser via Bright Data's Browser API
2. **Authentication**: Navigates to OAuth login page and submits credentials
3. **Navigation**: Redirects to the search results page
4. **Data Extraction**:
   - Scrapes DOM for vehicle listings
   - Intercepts API responses for additional data
   - Filters for Honda and Toyota makes only
5. **Output**: Saves results to JSON file and captures screenshot

## Troubleshooting

### Login Issues
- Verify credentials in `.env` file
- Check if Manheim has CAPTCHA or 2FA enabled
- Review screenshot to see what page loaded

### No Vehicles Found
- Check `page.html` to verify page structure
- Adjust selectors in `scraper.js` if Manheim updated their HTML
- Review console output for specific errors

### Connection Issues
- Verify Bright Data credentials are correct
- Check Browser API endpoint is active
- Ensure you have sufficient credits in your Bright Data account

## Security Notes

- **Never commit `.env` file** - Contains sensitive credentials
- Credentials are stored in environment variables only
- `.gitignore` prevents accidental commits of sensitive data
- Use this scraper responsibly and in accordance with Manheim's Terms of Service

## Customization

### Change Target Vehicles

Modify `VEHICLE_MAKES` in `.env`:

```env
VEHICLE_MAKES=Honda,Toyota,Ford,Chevrolet
```

### Adjust Selectors

If Manheim changes their page structure, update selectors in `scraper.js`:

```javascript
// Line ~168 - Vehicle listing selectors
const vehicleElements = document.querySelectorAll('[class*="vehicle"], [class*="listing"]');
```

## Legal Disclaimer

This scraper is for educational purposes. Ensure you have permission to scrape the target website and comply with their Terms of Service and robots.txt. Web scraping may be subject to legal restrictions in your jurisdiction.

## License

ISC
