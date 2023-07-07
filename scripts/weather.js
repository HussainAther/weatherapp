// OpenWeather API endpoint for current weather and forecast
const currentWeatherURL = 'https://api.openweathermap.org/data/2.5/weather';
const forecastURL = 'https://api.openweathermap.org/data/2.5/onecall';
const unsplashURL = 'https://api.unsplash.com/search/photos';
const historicalWeatherURL = 'https://history.openweathermap.org/data/2.5/history/city';
const openweatherAccessKey = 'your_openweather_api_key';
const historicalAccessKey = 'your_historical_api_key'; // Leave empty if not using historical data
const unsplashAccessKey = 'your_unsplash_api_key';
const googlemapsAccessKey = 'your_googlemaps_api_key'; // Leave unchanged if you don't want to retrieve your own ZIP code

let isMetric = false; // Flag to track temperature unit (false: Fahrenheit, true: Celsius)

// Function to fetch current weather data
async function fetchCurrentWeatherData(zipCode) {
  try {
    const isCanadianPostalCode = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(zipCode);

    let currentWeatherURLWithParams;
    if (isCanadianPostalCode) {
      const zipCodePrefix = zipCode.slice(0, 3);
      currentWeatherURLWithParams = `${currentWeatherURL}?zip=${zipCodePrefix},ca&appid=${openweatherAccessKey}`;
    } else {
      currentWeatherURLWithParams = `${currentWeatherURL}?zip=${zipCode},us&appid=${openweatherAccessKey}`;
    }
    console.log(currentWeatherURLWithParams);
    const currentWeatherResponse = await fetch(currentWeatherURLWithParams);
    const currentWeatherData = await currentWeatherResponse.json();

    if (currentWeatherResponse.status !== 200) {
      throw new Error(currentWeatherData.message);
    }

    const {
      coord,
      weather,
      base,
      main,
      visibility,
      wind,
      rain,
      snow,
      clouds,
      dt,
      sys,
      timezone,
      id,
      name,
      cod
    } = currentWeatherData;

    const currentWeather = {
      coordinates: {
        lon: coord.lon,
        lat: coord.lat
      },
      weather: {
        id: weather[0].id,
        main: weather[0].main,
        description: weather[0].description,
        icon: weather[0].icon
      },
      base,
      main: {
        temperature: main.temp,
        feelsLike: main.feels_like,
        temperatureMin: main.temp_min,
        temperatureMax: main.temp_max,
        pressure: main.pressure,
        humidity: main.humidity,
        seaLevel: main.sea_level,
        groundLevel: main.grnd_level
      },
      visibility,
      wind: {
        speed: wind.speed,
        degree: wind.deg,
        gust: wind.gust
      },
      rain: rain ? rain['1h'] : 0,
      snow: snow ? snow['1h'] : 0,
      clouds: clouds.all,
      dt,
      sys: {
        type: sys.type,
        id: sys.id,
        country: sys.country,
        sunrise: sys.sunrise,
        sunset: sys.sunset
      },
      timezone,
      id,
      name,
      cod
    };

    return currentWeather;
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
    const isCanadianPostalCode = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(zipCode);

    let currentWeatherParams; // Declare the variable outside the if statement

    if (isCanadianPostalCode) {
      const zipCodePrefix = zipCode.slice(0, 3);
      currentWeatherParams = `zip=${zipCodePrefix},ca&appid=${openweatherAccessKey}`; // Assign value inside the if block
    } else {
      currentWeatherParams = `zip=${zipCode},us&appid=${openweatherAccessKey}`; // Assign value inside the else block
    }
    
    const currentWeatherURLWithParams = `${currentWeatherURL}?${currentWeatherParams}`;

    const currentWeatherResponse = await fetch(currentWeatherURLWithParams);
    const currentWeatherData = await currentWeatherResponse.json();
    const { lat, lon } = currentWeatherData.coord;
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

    // Extract weather information for the current weather
    const currentWeatherInfo = {
      temperature: currentWeatherData.main.temp,
      humidity: currentWeatherData.main.humidity,
      temperatureMin: currentWeatherData.main.temp_min, // Fix: changed from temperatureMin to temp_min
      temperatureMax: currentWeatherData.main.temp_max, 
      rain: currentWeatherData.rain?.['1h'] || 0,
      snow: currentWeatherData.snow?.['1h'] || 0,
      clouds: currentWeatherData.clouds.all,
      windSpeed: currentWeatherData.wind.speed,
      windDegree: currentWeatherData.wind.deg,
    };    

    const weatherData = {
      current: currentWeatherInfo,
      forecast: forecastData.daily,
      historical: historicalWeather,
    };

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

// Function to convert wind speed from meters per second to the desired unit
function convertWindSpeed(speed) {
  if (isMetric) {
    // Convert to meters per second
    return `${speed} m/s`;
  } else {
    // Convert to miles per hour
    return `${(speed * 2.23694).toFixed(1)} mph`;
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

  const currentWeatherCard = createWeatherCard(
    'Current Weather',
    convertTemperature(currentWeather.temperature),
    convertTemperature(currentWeather.temperatureMax),
    convertTemperature(currentWeather.temperatureMin),
    currentWeather.humidity,
    currentWeather.rain,
    currentWeather.snow,
    currentWeather.clouds,
    convertWindSpeed(currentWeather.windSpeed),
    currentWeather.windDegree
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
        historicalItem.humidity,
        historicalItem.rain,
        historicalItem.snow,
        historicalItem.clouds,
        convertWindSpeed(historicalItem.wind.speed),
        historicalItem.wind.degree
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
      day.humidity,
      day.rain,
      day.snow,
      day.clouds,
      convertWindSpeed(day.wind_speed),
      day.wind_deg
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

function createWeatherCard(
  title,
  temperature,
  highTemperature,
  lowTemperature,
  humidity,
  rain,
  snow,
  clouds,
  windSpeed,
  windDegree
) {
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

  if (rain !== undefined && rain !== 0) {
    const rainElement = document.createElement('p');
    rainElement.innerHTML = `Rain: <span class="highlight">${rain} mm</span>`;
    weatherCard.appendChild(rainElement);

    const rainIcon = document.createElement('img');
    rainIcon.src = 'img/raindrop.png'; // Path to rain icon image
    rainIcon.alt = 'Rain Icon';
    weatherCard.appendChild(rainIcon);
  }

  if (snow !== undefined && snow !== 0) {
    const snowElement = document.createElement('p');
    snowElement.innerHTML = `Snow: <span class="highlight">${snow} mm</span>`;
    weatherCard.appendChild(snowElement);

    const snowIcon = document.createElement('img');
    snowIcon.src = 'img/snowflake.png'; // Path to snow icon image
    snowIcon.alt = 'Snow Icon';
    weatherCard.appendChild(snowIcon);
  }

  if (clouds !== undefined) {
    if (clouds > 30 && clouds < 50) {
      const cloudIcon = document.createElement('img');
      cloudIcon.src = 'img/oneblankcloud.png'; // Path to one blank cloud icon image
      cloudIcon.alt = 'One Blank Cloud Icon';
      weatherCard.appendChild(cloudIcon);
    } else if (clouds >= 50) {
      const cloudIcon = document.createElement('img');
      cloudIcon.src = 'img/twoblanksclouds.png'; // Path to two blank clouds icon image
      cloudIcon.alt = 'Two Blank Clouds Icon';
      weatherCard.appendChild(cloudIcon);
    } else {
      const sunIcon = document.createElement('img');
      sunIcon.src = 'img/sun.png'; // Path to sun icon image
      sunIcon.alt = 'Sun Icon';
      weatherCard.appendChild(sunIcon);
    }

    const cloudsElement = document.createElement('p');
    cloudsElement.innerHTML = `Clouds: <span class="highlight">${clouds}%</span>`;
    weatherCard.appendChild(cloudsElement);
  }

  const windElement = document.createElement('p');
  windElement.innerHTML = `Wind: <span class="highlight">${windSpeed} m/s, ${windDegree}°</span>`;
  weatherCard.appendChild(windElement);

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

// Function to reverse geocode the coordinates and retrieve the zip code
async function reverseGeocode(latitude, longitude) {
  try {
    const reverseGeocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googlemapsAccessKey}`;

    const response = await fetch(reverseGeocodeURL);
    const data = await response.json();

    if (response.status !== 200) {
      throw new Error(data.error_message || 'Reverse geocoding failed');
    }

    const results = data.results;
    if (results.length > 0) {
      for (const result of results) {
        for (const component of result.address_components) {
          if (component.types.includes('postal_code')) {
            return component.short_name;
          }
        }
      }
    }

    throw new Error('Zip code not found in the reverse geocoding results');
  } catch (error) {
    throw new Error(error.message);
  }
}

// Function to fetch weather data based on geolocation
function fetchWeatherByGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        if (googlemapsAccessKey === 'your_googlemaps_api_key') {
          console.log('Google Maps API key is not provided.');
          alert('Google Maps API key is not provided.');
          return;
        }

        try {
          const zipCode = await reverseGeocode(latitude, longitude);

          fetchWeatherData(zipCode)
            .then((weatherData) => {
              displayWeatherData(weatherData);

              // Update the search input field with the user's current zip code
              const zipCodeInput = document.getElementById('zip-input');
              zipCodeInput.value = zipCode;
            })
            .catch((error) => {
              console.log('Error:', error);
              alert('Error occurred while fetching weather data. Please try again.');
            });
        } catch (error) {
          console.log('Reverse geocoding error:', error);
          alert('Error occurred while reverse geocoding. Please try again.');
        }
      },
      (error) => {
        console.log('Geolocation error:', error);
        alert('Error occurred while fetching geolocation. Please try again.');
      }
    );
  } else {
    console.log('Geolocation is not supported by this browser.');
    alert('Geolocation is not supported by this browser.');
  }
}



// Function to fetch weather data using geolocation coordinates
async function fetchWeatherDataByGeolocation(latitude, longitude) {
  try {
    const currentWeatherParams = `lat=${latitude}&lon=${longitude}&appid=${openweatherAccessKey}`;
    const currentWeatherURLWithParams = `${currentWeatherURL}?${currentWeatherParams}`;

    const currentWeatherResponse = await fetch(currentWeatherURLWithParams);
    const currentWeatherData = await currentWeatherResponse.json();

    if (currentWeatherResponse.status !== 200) {
      throw new Error(currentWeatherData.message);
    }

    const { lat, lon } = currentWeatherData.coord;
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

    // Extract weather information for the current weather
    const currentWeatherInfo = {
      temperature: currentWeatherData.main.temp,
      humidity: currentWeatherData.main.humidity,
      temperatureMin: currentWeatherData.main.temp_min, // Fix: changed from temperatureMin to temp_min
      temperatureMax: currentWeatherData.main.temp_max, 
      rain: currentWeatherData.rain?.['1h'] || 0,
      snow: currentWeatherData.snow?.['1h'] || 0,
      clouds: currentWeatherData.clouds.all,
      windSpeed: currentWeatherData.wind.speed,
      windDegree: currentWeatherData.wind.deg,
    };    

    const weatherData = {
      current: currentWeatherInfo,
      forecast: forecastData.daily,
      historical: historicalWeather,
    };

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

const geolocationButton = document.getElementById('geolocation-button');
geolocationButton.addEventListener('click', fetchWeatherByGeolocation);
