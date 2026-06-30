const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherResult = document.getElementById('weatherResult');
const weatherBg = document.getElementById('weatherBg');

const weatherPopup = document.getElementById('weatherPopup');
const popupIcon = document.getElementById('popupIcon');
const popupText = document.getElementById('popupText');
const popupClose = document.getElementById('popupClose');

searchBtn.addEventListener('click', getWeather);

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});

popupClose.addEventListener('click', () => {
    weatherPopup.classList.remove('show');
});

async function getWeather() {
    const city = cityInput.value.trim();

    if (city === '') {
        weatherResult.innerHTML = `<p>Please enter a city name.</p>`;
        return;
    }

    weatherResult.innerHTML = `<p>Loading...</p>`;

    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            weatherResult.innerHTML = `<p>City not found. Try again.</p>`;
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherRes.json();

        displayWeather(weatherData.current_weather, name, country);

    } catch (error) {
        weatherResult.innerHTML = `<p>Something went wrong. Please try again.</p>`;
        console.error(error);
    }
}

function displayWeather(weather, city, country) {
    const temp = weather.temperature;
    const windSpeed = weather.windspeed;
    const condition = getWeatherCondition(weather.weathercode);

    setBackground(weather.weathercode);
    showAdvicePopup(weather.weathercode, temp);

    weatherResult.innerHTML = `
        <h2>${city}, ${country}</h2>
        <p class="condition">${condition}</p>
        <p class="temp">${temp}°C</p>
        <div class="details">
            <span>💨 ${windSpeed} km/h</span>
        </div>
    `;
}

function getWeatherCondition(code) {
    const conditions = {
        0: 'Clear Sky ☀️',
        1: 'Mainly Clear 🌤️',
        2: 'Partly Cloudy ⛅',
        3: 'Overcast ☁️',
        45: 'Foggy 🌫️',
        48: 'Foggy 🌫️',
        51: 'Light Drizzle 🌦️',
        61: 'Rain 🌧️',
        63: 'Moderate Rain 🌧️',
        65: 'Heavy Rain 🌧️',
        71: 'Snow ❄️',
        80: 'Rain Showers 🌦️',
        95: 'Thunderstorm ⛈️',
        96: 'Thunderstorm with Hail ⛈️',
        99: 'Severe Thunderstorm ⛈️'
    };

    return conditions[code] || 'Weather data unavailable';
}

function setBackground(code) {
    weatherBg.innerHTML = '';

    if (code === 0 || code === 1) {
        weatherBg.style.background = 'linear-gradient(135deg, #1e3c72, #2a5298)';
        const sun = document.createElement('div');
        sun.className = 'sun';
        weatherBg.appendChild(sun);

    } else if (code === 2 || code === 3 || code === 45 || code === 48) {
        weatherBg.style.background = 'linear-gradient(135deg, #4b6584, #708090)';
        addClouds();

    } else if ((code >= 51 && code < 70) || (code >= 80 && code < 90)) {
        weatherBg.style.background = 'linear-gradient(135deg, #2c3e50, #4b6584)';
        addClouds();
        addRain();

    } else if (code === 95 || code === 96 || code === 99) {
        weatherBg.style.background = 'linear-gradient(135deg, #0f0f1a, #232946)';
        addClouds();
        addRain();
        addLightning();

    } else {
        weatherBg.style.background = 'linear-gradient(135deg, #1e3c72, #2a5298, #00c6ff)';
    }
}

function addClouds() {
    const cloud1 = document.createElement('div');
    cloud1.className = 'cloud cloud1';
    const cloud2 = document.createElement('div');
    cloud2.className = 'cloud cloud2';
    weatherBg.appendChild(cloud1);
    weatherBg.appendChild(cloud2);
}

function addRain() {
    for (let i = 0; i < 40; i++) {
        const drop = document.createElement('div');
        drop.className = 'raindrop';
        drop.style.left = Math.random() * 100 + 'vw';
        drop.style.animationDuration = (0.5 + Math.random() * 0.7) + 's';
        drop.style.animationDelay = Math.random() * 2 + 's';
        weatherBg.appendChild(drop);
    }
}

function addLightning() {
    const flash = document.createElement('div');
    flash.className = 'lightning';
    weatherBg.appendChild(flash);

    const bolt = document.createElement('div');
    bolt.className = 'bolt';
    bolt.style.top = '10%';
    bolt.style.left = '40%';
    bolt.innerHTML = `
        <svg viewBox="0 0 60 140" xmlns="http://www.w3.org/2000/svg">
            <polygon points="30,0 10,70 28,70 15,140 50,55 30,55 45,0" fill="#ffe97a"/>
        </svg>
    `;
    weatherBg.appendChild(bolt);
}

function showAdvicePopup(code, temp) {
    let icon = '💡';
    let title = 'Heads up';
    let message = 'Have a great day!';

    if (code === 95 || code === 96 || code === 99) {
        icon = '⛈️';
        title = 'Thunderstorm Alert';
        message = "It's stormy out there. Stay indoors and avoid open areas if possible.";
    } else if ((code >= 51 && code < 70) || (code >= 80 && code < 90)) {
        icon = '☔';
        title = 'Rainy Day';
        message = 'Keep your umbrella with you when going out.';
    } else if (code === 2 || code === 3 || code === 45 || code === 48) {
        icon = '☁️';
        title = 'Cloudy Skies';
        message = 'Overcast today — a light jacket might be a good idea.';
    } else if (temp >= 35) {
        icon = '🥵';
        title = "It's Hot Today";
        message = 'Stay at home if you can, and stay hydrated.';
    } else if (temp <= 10) {
        icon = '🥶';
        title = "It's Cold Today";
        message = 'Bundle up before heading outside.';
    } else if (code === 0 || code === 1) {
        icon = '☀️';
        title = 'Clear Skies';
        message = "It's a great day to be outside. Don't forget sunscreen!";
    }

    popupIcon.textContent = icon;
    popupText.innerHTML = `<strong>${title}</strong>${message}`;

    weatherPopup.classList.add('show');

    clearTimeout(weatherPopup.hideTimer);
    weatherPopup.hideTimer = setTimeout(() => {
        weatherPopup.classList.remove('show');
    }, 6000);
}