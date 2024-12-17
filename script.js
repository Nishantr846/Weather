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

            // Fetch weather data with timezone adjustment
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`);
            if (!weatherRes.ok) {
                throw new Error("Weather data not available!");
            }

            const weatherData = await weatherRes.json();

            // Extract relevant data
            const temp = weatherData.current_weather.temperature;
            const conditionCode = weatherData.current_weather.weathercode; // Weather condition code
            const time = new Date(weatherData.current_weather.time);

            // Update UI
            updateDetails(temp, `${name}, ${country}`, time.toLocaleString(), `Code: ${conditionCode}`);
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
