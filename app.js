let valueSearch = document.getElementById('valueSearch');
let city = document.getElementById('city');
let temperature = document.querySelector('.temperature');
let degrees = document.querySelector('.degrees');
let description = document.querySelector('.description');
let windspeed = document.getElementById('windspeed');
let humidity = document.getElementById('humidity');
let windD = document.querySelector('.windD');
let weatherIcon = document.getElementById('weatherIcon');
//let forcast = document.querySelector('.name');
const form = document.querySelector('form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const searchedCity = valueSearch.value.trim();

  if (searchedCity !== "") {
    await getWeatherForecast(searchedCity);
  }
});

async function getWeatherForecast(cityInput = valueSearch.value) {
  const cityName = cityInput.trim();

  console.log("🔍 Searching for city:", cityName);

  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(cityName)}`
    );

    if (!geoRes.ok) {
      throw new Error(`Geocoding failed: ${geoRes.status}`);
    }

    const geoData = await geoRes.json();

    if (!geoData.length) {
      throw new Error("City not found");
    }

    const lat = Number(geoData[0].lat).toFixed(4);
    const lon = Number(geoData[0].lon).toFixed(4);

    console.log("📍 Coordinates:", lat, lon);

    const pointRes = await fetch(
      `https://api.weather.gov/points/${lat},${lon}`
    );

    if (!pointRes.ok) {
      throw new Error(`Weather.gov point request failed: ${pointRes.status}`);
    }

    const pointData = await pointRes.json();

    if (!pointData.properties?.forecast) {
      throw new Error("No forecast URL returned");
    }

    const forecastUrl = pointData.properties.forecast;

    console.log("🛰 Forecast URL:", forecastUrl);

    const forecastRes = await fetch(forecastUrl);

    if (!forecastRes.ok) {
      throw new Error(`Forecast request failed: ${forecastRes.status}`);
    }

    const forecastData = await forecastRes.json();

    const today = forecastData.properties?.periods?.[0];

    if (!today) {
      throw new Error("No forecast data returned");
    }

    console.log("🌤 Today's Forecast:", today);

    city.querySelector("figcaption").innerText = cityName;
    weatherIcon.src = today.icon;
    degrees.querySelector("span").innerText = today.temperature;
    description.innerText = today.shortForecast;

    windspeed.innerText = today.windSpeed;
    humidity.innerText = "N/A";
    windD.innerText = today.windDirection;

  } catch (err) {
    console.error("❌ Error:", err);
  }
}


async function autoDetectLocation() {

  if (!navigator.geolocation) {
    fallbackCity();
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    console.log("📍 User Coordinates:", lat, lon);

    try {

      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );

      if (!geoRes.ok) {
        throw new Error(`Reverse geocoding failed: ${geoRes.status}`);
      }

      const geoData = await geoRes.json();

      const detectedCity =
        geoData.address.city ||
        geoData.address.town ||
        geoData.address.village ||
        geoData.address.municipality ||
        geoData.address.hamlet;

      console.log("🏙 Detected city:", detectedCity);

      if (detectedCity) {
        //valueSearch.value = detectedCity;

        await getWeatherForecast(detectedCity);
      } else {
        fallbackCity();
      }

    } catch (err) {

      console.log("Location lookup failed");

      fallbackCity();

    }

  }, () => {

    fallbackCity();

  });

}


function fallbackCity() {

  getWeatherForecast("Dallas");

}


// RUN WHEN PAGE LOADS
autoDetectLocation();
