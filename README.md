# Weather App

The Weather App is a web application that allows users to retrieve current weather information and an 8-day forecast based on a provided ZIP code. Additionally, it offers the option to fetch historical weather data by inputting an API key (which requires a subscription) for access to OpenWeather's historical weather API.

The app works with both US and Canadian ZIP Codes. 

## Features

- Current Weather: Retrieve real-time weather data for the specified location.
- Forecast: Get an 8-day weather forecast for the provided ZIP code.
- Historical Weather (Optional): If you have an API key, you can access historical weather data.
- City Photos: Display a photo of the city obtained from Unsplash API.

## APIs Used

- OpenWeather API: Provides current weather, forecast, and historical weather data. Visit their [website](https://openweathermap.org/) for more information.
- Unsplash API: Retrieves photos of cities based on the search query. For more details, refer to the [Unsplash API documentation](https://unsplash.com/documentation).

To use the historical weather feature, you need a subscription and an API key from OpenWeather. Visit the [OpenWeather History API](https://openweathermap.org/history) page for more information on accessing historical weather data.

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/weather-app.git
   ```

2. Navigate to the project directory:

    ```bash
    cd weather-app
    ```

3. Open the index.html file in a web browser.

## Usage
1. Enter a ZIP code in the provided input field.
2. Click the "Search" button.
3. The current weather, 8-day forecast, and a photo of the city will be displayed.
4. Use the "Switch to Fahrenheit" or "Switch to Celsius" button to toggle between temperature units.

## Configuration
In the `weather.js` file, you need to set the following API access keys:

* openweatherAccessKey: Your OpenWeather API key for accessing current weather and forecast.
* historicalAccessKey: Your OpenWeather API key for accessing historical weather data (optional).
* unsplashAccessKey: Your Unsplash API key for retrieving city photos.

```
const openweatherAccessKey = 'your_openweather_api_key';
const historicalAccessKey = 'your_historical_api_key'; // Leave empty if not using historical data
const unsplashAccessKey = 'your_unsplash_api_key';
```

Make sure to replace 'your_openweather_api_key', 'your_historical_api_key', and 'your_unsplash_api_key' with your respective API keys.

## Sources

Weather icons from: https://stock.adobe.com/24218050?sdid=DMMD1BPP&mv=social&mv2=orgsoc&as_channel=social_ads&as_campclass=brand&as_campaign=Ecommerce&as_source=Pinterest&as_camptype=acquisitions&as_audience=users

Icons sourced from Adobe Stock, licensed under the Adobe Standard License.


## License
This project is licensed under the MIT License.

