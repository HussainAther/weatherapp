// OpenWeather API endpoint for current weather and forecast
const currentWeatherURL = 'https://api.openweathermap.org/data/2.5/weather';
const forecastURL = 'https://api.openweathermap.org/data/2.5/onecall';
const unsplashURL = 'https://api.unsplash.com/search/photos';
const historicalWeatherURL = 'https://history.openweathermap.org/data/2.5/history/city';
const openweatherAccessKey = 'your_openweather_api_key';
const historicalAccessKey = 'your_historical_api_key';
const unsplashAccessKey = 'your_upslash_api_key';

let isMetric = false; // Flag to track temperature unit (false: Fahrenheit, true: Celsius)

// Function to fetch current weather data
async function fetchCurrentWeatherData(zipCode) {
  try {
    const currentWeatherParams = `zip=${zipCode}&appid=${openweatherAccessKey}`;
    const currentWeatherURLWithParams = `${currentWeatherURL}?${currentWeatherParams}`;

    const currentWeatherResponse = await fetch(currentWeatherURLWithParams);
    const currentWeatherData = await currentWeatherResponse.json();

    if (currentWeatherResponse.status !== 200) {
      throw new Error(currentWeatherData.message);
    }

    return currentWeatherData;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Function to fetch historical weather data
async function fetchHistoricalWeatherData(lat, lon) {
  try {
    const historicalWeatherParams = `lat=${lat}&lon=${lon}&appid=${historicalAccessKey}`;
    const historicalWeatherURLWithParams = `${historicalWeatherURL}?${historicalWeatherParams}`;

    if (historicalAccessKey !== 'your_historical_api_key') {
      const historicalWeatherResponse = await fetch(historicalWeatherURLWithParams);
      const historicalWeatherData = await historicalWeatherResponse.json();

      if (historicalWeatherResponse.status !== 200) {
        throw new Error(historicalWeatherData.message);
      }

      const weatherList = historicalWeatherData.list.map((item) => ({
        temperature: item.main.temp,
        humidity: item.main.humidity,
        minTemperature: item.main.temp_min,
        maxTemperature: item.main.temp_max,
      }));

      return weatherList;
    } else {
      return []; // Return an empty array if historicalAccessKey is not provided
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

// Function to fetch weather data
async function fetchWeatherData(zipCode) {
  try {
    const currentWeather = await fetchCurrentWeatherData(zipCode);
    const currentWeatherParams = `zip=${zipCode}&appid=${openweatherAccessKey}`;
    const currentWeatherURLWithParams = `${currentWeatherURL}?${currentWeatherParams}`;

    const currentWeatherResponse = await fetch(currentWeatherURLWithParams);
    const currentWeatherData = await currentWeatherResponse.json();
    const { lat, lon } = currentWeather.coord;
    let historicalWeather = [];

    if (historicalAccessKey) {
      historicalWeather = await fetchHistoricalWeatherData(lat, lon);
    }
    const cityName = currentWeatherData.name;

    const forecastParams = `lat=${currentWeatherData.coord.lat}&lon=${currentWeatherData.coord.lon}&exclude=minutely,hourly&appid=${openweatherAccessKey}`;
    const forecastURLWithParams = `${forecastURL}?${forecastParams}`;

    const forecastResponse = await fetch(forecastURLWithParams);
    const forecastData = await forecastResponse.json();

    if (forecastResponse.status !== 200) {
      throw new Error(forecastData.message);
    }

    const weatherData = { current: currentWeather, forecast: forecastData.daily, historical: historicalWeather };

    // Fetch city photo from Unsplash
    const unsplashParams = `query=${cityName}&client_id=${unsplashAccessKey}`;
    const unsplashURLWithParams = `${unsplashURL}?${unsplashParams}`;

    const unsplashResponse = await fetch(unsplashURLWithParams);
    const unsplashData = await unsplashResponse.json();

    if (unsplashResponse.status !== 200) {
      throw new Error(unsplashData.errors[0]);
    }

    const cityPhoto = unsplashData.results[0]?.urls.regular;

    // Add city photo URL to weather data
    weatherData.cityPhoto = cityPhoto;

    return weatherData;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Function to convert temperature from Kelvin to Celsius or Fahrenheit
function convertTemperature(temp) {
  if (isMetric) {
    // Convert to Celsius
    return ((temp - 273.15)).toFixed(1) + '°C';
  } else {
    // Convert to Fahrenheit
    return ((temp - 273.15) * (9 / 5) + 32).toFixed(1) + '°F';
  }
}

// Function to display weather information
function displayWeatherData(weatherData) {
  const currentWeather = weatherData.current;
  const forecast = weatherData.forecast;
  const historicalWeather = weatherData.historical;
  const cityPhoto = weatherData.cityPhoto;

  // Example: Updating the weather container HTML
  const weatherContainer = document.getElementById('weather-container');
  weatherContainer.innerHTML = '';

  // Display current weather
  const currentWeatherCard = createWeatherCard(
    'Current Weather',
    convertTemperature(currentWeather.main.temp),
    convertTemperature(currentWeather.main.temp_max),
    convertTemperature(currentWeather.main.temp_min),
    currentWeather.main.humidity
  );
  weatherContainer.appendChild(currentWeatherCard);

  // Display historical weather if available
  if (historicalWeather.length > 0) {
    historicalWeather.forEach((historicalItem) => {
      const historicalWeatherCard = createWeatherCard(
        `Historical Weather (${new Date(historicalItem.dt * 1000).toLocaleDateString()})`,
        convertTemperature(historicalItem.temperature),
        convertTemperature(historicalItem.maxTemperature),
        convertTemperature(historicalItem.minTemperature),
        historicalItem.humidity
      );
      weatherContainer.appendChild(historicalWeatherCard);
    });
  }
    // Display forecast
    forecast.forEach((day, index) => {
      const forecastCard = createWeatherCard(
        `Day ${index + 1} Forecast`,
        convertTemperature(day.temp.day),
        convertTemperature(day.temp.max),
        convertTemperature(day.temp.min),
        day.humidity
      );
      weatherContainer.appendChild(forecastCard);
    });
    // Display city photo
    const photoContainer = document.getElementById('photo-container');
    if (cityPhoto) {
      const photoElement = document.createElement('img');
      photoElement.src = cityPhoto;
      photoContainer.innerHTML = '';
      photoContainer.appendChild(photoElement);
    } else {
      photoContainer.innerHTML = 'No photo available';
    }
}

// Function to create weather card element
function createWeatherCard(title, temperature, highTemperature, lowTemperature, humidity) {
  const weatherCard = document.createElement('div');
  weatherCard.classList.add('weather-card');

  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  weatherCard.appendChild(titleElement);

  const temperatureElement = document.createElement('p');
  temperatureElement.innerHTML = `Temperature: <span class="highlight">${temperature}</span>`;
  weatherCard.appendChild(temperatureElement);

  const highTemperatureElement = document.createElement('p');
  highTemperatureElement.innerHTML = `High: <span class="highlight">${highTemperature}</span>`;
  weatherCard.appendChild(highTemperatureElement);

  const lowTemperatureElement = document.createElement('p');
  lowTemperatureElement.innerHTML = `Low: <span class="highlight">${lowTemperature}</span>`;
  weatherCard.appendChild(lowTemperatureElement);

  const humidityElement = document.createElement('p');
  humidityElement.innerHTML = `Humidity: <span class="highlight">${humidity}%</span>`;
  weatherCard.appendChild(humidityElement);

  return weatherCard;
}

// Function to handle search button click
function handleSearch() {
  const zipCodeInput = document.getElementById('zip-input');
  const zipCode = zipCodeInput.value.trim();

  if (zipCode === '') {
    alert('Please enter a ZIP code.');
    return;
  }

  fetchWeatherData(zipCode)
    .then(displayWeatherData)
    .catch((error) => {
      console.log('Error:', error);
      alert('Error occurred while fetching weather data. Please try again.');
    });
}

// Function to handle temperature unit toggle
function handleToggle() {
  const toggleButton = document.getElementById('temperature-toggle');
  isMetric = !isMetric;
  toggleButton.textContent = isMetric ? 'Switch to Fahrenheit' : 'Switch to Celsius';
  handleSearch(); // Re-fetch and display weather data with updated temperature unit
}

// Attach event listener to search button
const searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', handleSearch);

// Attach event listener to temperature unit toggle button
const toggleButton = document.getElementById('temperature-toggle');
toggleButton.addEventListener('click', handleToggle);
