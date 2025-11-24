# Sample Data for Dashboard Development

This directory contains **realistic sample data** to help you build and test your dashboard before running the actual scraper.

## 📁 Sample Files Included

### 1. `vehicles.json` - Main scraped data
Contains 20 realistic Honda and Toyota vehicles with:
- ✅ Make, Model, Year
- ✅ Price, VIN, Mileage
- ✅ Trim, Color, Transmission
- ✅ Condition, Location
- ✅ Summary statistics

### 2. Data Structure

```json
{
  "scrapedAt": "2025-11-24T00:15:32.441Z",
  "targetMakes": ["honda", "toyota"],
  "vehiclesFromDOM": [...],  // Array of 20 vehicles
  "apiResponses": [...],      // API call data
  "pageUrl": "...",
  "summary": {
    "totalVehicles": 20,
    "byMake": { "Honda": 10, "Toyota": 10 },
    "byYear": { "2021": 6, "2022": 8, "2023": 6 },
    "priceRange": {...},
    "mileageRange": {...},
    "topModels": [...],
    "locations": [...]
  }
}
```

## 📊 Sample Data Statistics

| Metric | Value |
|--------|-------|
| **Total Vehicles** | 20 |
| **Honda** | 10 vehicles |
| **Toyota** | 10 vehicles |
| **Price Range** | $19,800 - $48,900 |
| **Average Price** | $31,545 |
| **Mileage Range** | 5,890 - 42,100 mi |
| **Model Years** | 2021-2023 |

## 🚗 Sample Vehicle Models

### Honda (10)
- Accord (2)
- CR-V (2)
- Civic (2)
- Pilot (1)
- Odyssey (1)
- HR-V (1)
- Passport (1)

### Toyota (10)
- Camry (2)
- RAV4 (2)
- Highlander (1)
- Corolla (1)
- Tacoma (1)
- Tundra (1)
- 4Runner (1)
- Sienna (1)

## 🎯 Use Cases for Dashboard

### 1. Vehicle Listings View
Display all vehicles in a table/grid with:
- Make, Model, Year
- Price (sortable)
- Mileage (sortable)
- Location

### 2. Statistics Dashboard
- Total vehicles by make (pie chart)
- Price distribution (histogram)
- Vehicles by year (bar chart)
- Geographic distribution (map)

### 3. Filters
- Filter by make
- Filter by price range
- Filter by mileage
- Filter by year
- Filter by location

### 4. Individual Vehicle Cards
Each vehicle shows:
- Image placeholder
- Year Make Model Trim
- Price and VIN
- Mileage and condition
- Location

## 💻 Example Dashboard Code

### React Example
```jsx
import vehiclesData from './vehicles.json';

function Dashboard() {
  const { vehiclesFromDOM, summary } = vehiclesData;

  return (
    <div>
      <h1>Manheim Auction Dashboard</h1>

      {/* Summary Stats */}
      <div className="stats">
        <div>Total: {summary.totalVehicles}</div>
        <div>Honda: {summary.byMake.Honda}</div>
        <div>Toyota: {summary.byMake.Toyota}</div>
        <div>Avg Price: {summary.priceRange.average}</div>
      </div>

      {/* Vehicle List */}
      <div className="vehicles">
        {vehiclesFromDOM.map((vehicle, idx) => (
          <div key={idx} className="vehicle-card">
            <h3>{vehicle.year} {vehicle.make} {vehicle.model}</h3>
            <p>Price: {vehicle.price}</p>
            <p>Mileage: {vehicle.mileage} mi</p>
            <p>VIN: {vehicle.vin}</p>
            <p>Location: {vehicle.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Python/Flask Example
```python
import json

with open('vehicles.json', 'r') as f:
    data = json.load(f)

vehicles = data['vehiclesFromDOM']
summary = data['summary']

# Use in your dashboard template
```

### Simple HTML/JavaScript
```html
<!DOCTYPE html>
<html>
<head>
    <title>Manheim Dashboard</title>
</head>
<body>
    <div id="dashboard"></div>

    <script>
        fetch('vehicles.json')
            .then(res => res.json())
            .then(data => {
                const dashboard = document.getElementById('dashboard');
                data.vehiclesFromDOM.forEach(vehicle => {
                    dashboard.innerHTML += `
                        <div class="card">
                            <h3>${vehicle.year} ${vehicle.make} ${vehicle.model}</h3>
                            <p>Price: ${vehicle.price}</p>
                            <p>Mileage: ${vehicle.mileage} mi</p>
                        </div>
                    `;
                });
            });
    </script>
</body>
</html>
```

## 🔄 Replacing with Real Data

When you run the actual scraper locally:

1. The scraper will overwrite `vehicles.json` with real data
2. The structure will be **identical** to this sample
3. Your dashboard code won't need any changes
4. Just refresh to see real scraped data

## ✅ Data Validation

All sample data follows realistic patterns:
- ✅ Valid VIN format (17 characters)
- ✅ Realistic pricing for 2021-2023 models
- ✅ Appropriate mileage for vehicle age
- ✅ Real trim levels and colors
- ✅ Valid US locations

## 🚀 Next Steps

1. **Build your dashboard** using this sample data
2. **Test all features** (sorting, filtering, stats)
3. **Run the scraper locally** when ready
4. **Replace sample with real data** - everything will work!

---

**Note**: This is sample data for development only. Run the actual scraper to get live Manheim auction data.
