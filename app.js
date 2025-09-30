let valueSearch = document.getElementById('valueSearch');
let city = document.getElementById('city');
let temperature = document.querySelector('.temperature');
let degrees = document.querySelector('.degrees');
let description = document.querySelector('.description');
let windspeed = document.getElementById('windspeed');
let humidity = document.getElementById('humidity');
let windD = document.querySelector('.windD');
let weatherIcon = document.getElementById('weatherIcon');
const form = document.querySelector('form')

form.addEventListener('submit', async (event) => {
  event.preventDefault();          // ← prevent the reload
  console.log('hello');
  //alert('Hello');
  await getWeatherForecast();      // ← fetch & render
});

 async function getWeatherForecast() {
    const cityName = valueSearch.value;
    console.log("🔍 Searching for city:", cityName);

    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`);
      const geoData = await geoRes.json();
      if (!geoData.length) throw new Error("City not found");

      const lat = geoData[0].lat;
      const lon = geoData[0].lon;
      console.log("📍 Coordinates:", lat, lon);

      const pointRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
      const pointData = await pointRes.json();
      const forecastUrl = pointData.properties.forecast;
      console.log("🛰 Forecast URL:", forecastUrl);

      const forecastRes = await fetch(forecastUrl);
      const forecastData = await forecastRes.json();
      const today = forecastData.properties.periods[0];
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
