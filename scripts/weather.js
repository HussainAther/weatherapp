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

  const weatherContainer = document.getElementById('weather-container');
  weatherContainer.innerHTML = '';

  // Display current weather
  const currentWeatherCard = createWeatherCard(
    'Current Weather',
    convertKelvinToFahrenheit(currentWeather.temp).toFixed(1),
    currentWeather.humidity
  );
  weatherContainer.appendChild(currentWeatherCard);

  // Display forecast
  forecast.forEach((day, index) => {
    const forecastCard = createWeatherCard(
      `Day ${index + 1} Forecast`,
      convertKelvinToFahrenheit(day.temp.max).toFixed(1),
      day.humidity
    );
    weatherContainer.appendChild(forecastCard);
  });
}

// Function to create weather card element
function createWeatherCard(title, temperature, humidity) {
  const weatherCard = document.createElement('div');
  weatherCard.classList.add('weather-card');

  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  weatherCard.appendChild(titleElement);

  const temperatureElement = document.createElement('p');
  temperatureElement.innerHTML = `Temperature: <span class="highlight">${temperature}°F</span>`;
  weatherCard.appendChild(temperatureElement);

  const humidityElement = document.createElement('p');
  humidityElement.innerHTML = `Humidity: <span class="highlight">${humidity}%</span>`;
  weatherCard.appendChild(humidityElement);

  return weatherCard;
}

// Example usage: Fetch weather data for a specific location
const latitude = 37.7749; // Replace with desired latitude
const longitude = -122.4194; // Replace with desired longitude

fetchWeatherData(latitude, longitude)
  .then(displayWeatherData)
  .catch((error) => {
    console.log('Error:', error);
  });

