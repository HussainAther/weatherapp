// OpenWeather API endpoint for current weather and forecast
const currentWeatherURL = 'https://api.openweathermap.org/data/2.5/onecall';
const apiKey = 'e9e6a5ee0ae50574cbfee017b1d3741b';

// Function to fetch weather data
async function fetchWeatherData(lat, lon) {
  const url = `${currentWeatherURL}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Function to convert temperature from Kelvin to Fahrenheit
function convertKelvinToFahrenheit(kelvin) {
  return (kelvin - 273.15) * (9 / 5) + 32;
}

// Function to display weather information
function displayWeatherData(weatherData) {
  const currentWeather = weatherData.current;
  const forecast = weatherData.daily;

  // Display current weather
  console.log('Current Weather:');
  console.log('Temperature:', convertKelvinToFahrenheit(currentWeather.temp), '°F');
  console.log('Humidity:', currentWeather.humidity, '%');

  // Display forecast
  console.log('Forecast:');
  forecast.forEach((day, index) => {
    console.log('Day', index + 1);
    console.log('High:', convertKelvinToFahrenheit(day.temp.max), '°F');
    console.log('Low:', convertKelvinToFahrenheit(day.temp.min), '°F');
    console.log('Humidity:', day.humidity, '%');
  });
}

// Example usage: Fetch weather data for a specific location
const latitude = 37.7749; // Replace with desired latitude
const longitude = -122.4194; // Replace with desired longitude

fetchWeatherData(latitude, longitude)
  .then(displayWeatherData)
  .catch((error) => {
    console.log('Error:', error);
  });

