// OpenWeather API endpoint for current weather and forecast
const currentWeatherURL = 'https://api.openweathermap.org/data/2.5/weather';
const forecastURL = 'https://api.openweathermap.org/data/2.5/onecall';
const apiKey = 'e9e6a5ee0ae50574cbfee017b1d3741b';

// Function to fetch weather data
async function fetchWeatherData(zipCode) {
  try {
    const currentWeatherParams = `zip=${zipCode}&appid=${apiKey}`;
    const currentWeatherURLWithParams = `${currentWeatherURL}?${currentWeatherParams}`;

    const currentWeatherResponse = await fetch(currentWeatherURLWithParams);
    const currentWeatherData = await currentWeatherResponse.json();

    if (currentWeatherResponse.status !== 200) {
      throw new Error(currentWeatherData.message);
    }

    const { lat, lon } = currentWeatherData.coord;

    const forecastParams = `lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}`;
    const forecastURLWithParams = `${forecastURL}?${forecastParams}`;

    const forecastResponse = await fetch(forecastURLWithParams);
    const forecastData = await forecastResponse.json();

    if (forecastResponse.status !== 200) {
      throw new Error(forecastData.message);
    }

    return { current: currentWeatherData, forecast: forecastData.daily };
  } catch (error) {
    throw new Error(error.message);
  }
}


// Function to convert temperature from Kelvin to Fahrenheit
function convertKelvinToFahrenheit(kelvin) {
  return (kelvin - 273.15) * (9 / 5) + 32;
}

// Function to display weather information
function displayWeatherData(weatherData) {
  const currentWeather = weatherData.current;
  const forecast = weatherData.forecast;

  const weatherContainer = document.getElementById('weather-container');
  weatherContainer.innerHTML = '';

  // Display current weather
  const currentWeatherCard = createWeatherCard(
    'Current Weather',
    convertKelvinToFahrenheit(currentWeather.main.temp).toFixed(1),
    convertKelvinToFahrenheit(currentWeather.main.temp_max).toFixed(1),
    convertKelvinToFahrenheit(currentWeather.main.temp_min).toFixed(1),
    currentWeather.main.humidity
  );
  weatherContainer.appendChild(currentWeatherCard);

  // Display forecast
  forecast.forEach((day, index) => {
    const forecastCard = createWeatherCard(
      `Day ${index + 1} Forecast`,
      convertKelvinToFahrenheit(day.temp.day).toFixed(1),
      convertKelvinToFahrenheit(day.temp.max).toFixed(1),
      convertKelvinToFahrenheit(day.temp.min).toFixed(1),
      day.humidity
    );
    weatherContainer.appendChild(forecastCard);
  });
}

// Function to create weather card element
function createWeatherCard(title, temperature, highTemperature, lowTemperature, humidity) {
  const weatherCard = document.createElement('div');
  weatherCard.classList.add('weather-card');

  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  weatherCard.appendChild(titleElement);

  const temperatureElement = document.createElement('p');
  temperatureElement.innerHTML = `Temperature: <span class="highlight">${temperature}°F</span>`;
  weatherCard.appendChild(temperatureElement);

  const highTemperatureElement = document.createElement('p');
  highTemperatureElement.innerHTML = `High: <span class="highlight">${highTemperature}°F</span>`;
  weatherCard.appendChild(highTemperatureElement);

  const lowTemperatureElement = document.createElement('p');
  lowTemperatureElement.innerHTML = `Low: <span class="highlight">${lowTemperature}°F</span>`;
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


// Attach event listener to search button
const searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', handleSearch);
