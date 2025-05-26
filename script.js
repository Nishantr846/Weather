const temperatureField = document.querySelector(".temp p");
const locationField = document.querySelector(".time_location p:first-child");
const dateAndTimeField = document.querySelector(".time_location .date_time");
const conditionField = document.querySelector(".condition p");
const searchField = document.querySelector(".search_area");
const form = document.querySelector("form");

// Default location to fetch weather data for initially
let target = "Bhubaneswar";

const fetchResults = async (targetLocation) => {
    try {
        // Fetch geocoding data to get latitude and longitude
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${targetLocation}`);
        if (!geoRes.ok) {
            throw new Error("Location not found!");
        }

        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
            const { latitude, longitude, name, country } = geoData.results[0];

            // Fetch weather data with timezone adjustment, including daily forecast
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`);
            if (!weatherRes.ok) {
                throw new Error("Weather data not available!");
            }

            const weatherData = await weatherRes.json();

            // Extract relevant data for current weather
            const temp = weatherData.current_weather.temperature;
            const conditionCode = weatherData.current_weather.weathercode; // Weather condition code
            const time = new Date(weatherData.current_weather.time);

            // Update UI for current weather
            updateDetails(temp, `${name}, ${country}`, time.toLocaleString(), `Code: ${conditionCode}`);

            // Update 7-day forecast
            if (weatherData.daily) {
                update7DayForecast(weatherData.daily);
            } else {
                console.error("Daily forecast data not available.");
                const forecastDaysContainer = document.getElementById("forecast_days_container");
                if (forecastDaysContainer) {
                    forecastDaysContainer.innerHTML = '<p>Daily forecast data is currently unavailable.</p>';
                }
            }
        } else {
            throw new Error("Location not found!");
        }
    } catch (error) {
        alert(error.message);
    }
};

const updateDetails = (temp, locationDetails, time, condition) => {
    temperatureField.innerText = `${temp}°C`;
    locationField.innerText = locationDetails;
    dateAndTimeField.innerText = time;
    conditionField.innerText = condition;
};

// Function to update the 7-day forecast display
const update7DayForecast = (dailyData) => {
    const forecastDaysContainer = document.getElementById("forecast_days_container");
    if (!forecastDaysContainer) {
        console.error("Forecast container 'forecast_days_container' not found in the DOM.");
        return;
    }

    forecastDaysContainer.innerHTML = ''; // Clear previous forecast content

    // Validate dailyData structure
    if (!dailyData || !dailyData.time || !dailyData.weathercode || !dailyData.temperature_2m_max || !dailyData.temperature_2m_min ||
        dailyData.time.length === 0) {
        forecastDaysContainer.innerHTML = '<p>Detailed daily forecast data is currently unavailable or incomplete.</p>';
        console.error("Incomplete or missing daily forecast data received:", dailyData);
        return;
    }

    for (let i = 0; i < dailyData.time.length; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("forecast-day");

        const dateString = dailyData.time[i];
        // Ensure date is interpreted as local time midnight, not UTC midnight, to avoid off-by-one day errors for some timezones.
        const date = new Date(dateString + 'T00:00:00'); 
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const weatherCode = dailyData.weathercode[i];
        const maxTemp = dailyData.temperature_2m_max[i];
        const minTemp = dailyData.temperature_2m_min[i];

        dayDiv.innerHTML = `
            <p class="forecast-day-name">${dayName}</p>
            <p class="forecast-condition">Code: ${weatherCode}</p>
            <p class="forecast-temp">Max: ${maxTemp}°C</p>
            <p class="forecast-temp">Min: ${minTemp}°C</p>
        `;
        forecastDaysContainer.appendChild(dayDiv);
    }
};

// Form submit handler
form.addEventListener("submit", (e) => {
    e.preventDefault();
    target = searchField.value.trim();
    if (target) {
        fetchResults(target);
        searchField.value = ""; // Clear input field
    } else {
        alert("Please enter a location");
    }
});

// Fetch weather data for the default location on page load
fetchResults(target);
