const dotenv = require('dotenv');
dotenv.config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Setup empty JS object to act as endpoint for all routes
const tripStore = [];
const userStore = [];

const path = require('path');

// Require Express to run the server and routes
const express = require('express');

// Start an instance of the Express app
const travelApp = express();

/** Dependencies */
const bodyParser = require('body-parser');

/* Middleware */
// Configure Express to use body-parser as middleware
travelApp.use(bodyParser.urlencoded({ extended: false }));
travelApp.use(bodyParser.json());

// Allow cross-origin resource sharing (CORS)
const cors = require('cors');
travelApp.use(cors());

// Serve static files from the 'dist' folder
travelApp.use(express.static('dist'));

// Log the current directory
console.log(__dirname);

// Default route to serve the index.html file
travelApp.get('/', function (req, res) {
  res.sendFile('dist/index.html');
});

// Set up the server
const port = 8005;
const travelServer = travelApp.listen(port, serverRunning);
function serverRunning() {
  console.log('Server is running');
  console.log(`Listening on localhost:${port}`);
}

// Route to return user data
travelApp.get('/client', fetchUserData);

function fetchUserData(req, res) {
  res.send(userStore);
}

// GeoNames API configuration
const geoNamesBaseURL = 'http://secure.geonames.org/searchJSON?q=';
const geoNamesApiKey = process.env.GEONAMES_USERNAME;

// Weatherbit API configuration
const weatherbitURL = 'https://api.weatherbit.io/v2.0/forecast/daily?';
const weatherbitURLhist = 'http://api.weatherbit.io/v2.0/history/daily?';
const weatherbitApiKey = process.env.WEATHERBIT_KEY;

// Pixabay API configuration
const pixabayBaseURL = 'https://pixabay.com/api/?';
const pixabayApiKey = process.env.BIXABAY_KEY;

// Function to retrieve coordinates using GeoNames API
const fetchGeoCoordinates = async () => {
  const latestTrip = userStore[userStore.length - 1];
  const city = latestTrip.city;

  try {
    const response = await fetch(`${geoNamesBaseURL}${city}${geoNamesApiKey}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch GeoNames data');
    }

    const geoDataArray = await response.json();
    const geoData = geoDataArray.geonames[0];

    if (!geoData) {
      throw new Error('No geonames data found for the given city');
    }

    // Update userStore with the fetched coordinates and country name
    Object.assign(latestTrip, {
      latitude: geoData.lat,
      longitude: geoData.lng,
      country: geoData.countryName,
    });

    console.log('Coordinates fetched from GeoNames for:', latestTrip.city);

  } catch (error) {
    console.error('Error fetching GeoNames data:', error.message || error);
  }
};


const fetchCountryDetails = async () => {
  let countryName = userStore[userStore.length - 1].country;

  const restCountriesURL = `https://restcountries.com/v3.1/name/${countryName}`;
  
  try {
    const response = await fetch(restCountriesURL);
    const countryDataArray = await response.json();
    const countryData = countryDataArray[0]; // Since it's an array, pick the first element
    
    // Log the entire country object for debugging
    console.log('Country data:', countryData);
    
    // Add country-specific information to the latest user trip
    userStore[userStore.length - 1].capital = countryData.capital ? countryData.capital[0] : 'Not available';
    userStore[userStore.length - 1].population = countryData.population || 'Not available';
    userStore[userStore.length - 1].currency = countryData.currencies 
      ? Object.keys(countryData.currencies).map((key) => countryData.currencies[key].name).join(', ') 
      : 'Not available';
    userStore[userStore.length - 1].region = countryData.region || 'Not available';
    
    console.log('Country details updated in userStore:', userStore[userStore.length - 1]);
  } catch (error) {
    console.log('Error fetching country details:', error);
  }
};

// Write an async function that uses fetch() to make a GET request to the Weatherbit API
const fetchWeatherBit = async () => {
  const latestTrip = userStore[userStore.length - 1];  
  const { latitude, longitude, daysLeft, arrival } = latestTrip;

  let weatherRequest;

  if (daysLeft < 17) {
    // Fetch forecasted weather if the trip is within 17 days
    weatherRequest = `${weatherbitURL}lat=${latitude}&lon=${longitude}&key=${weatherbitApiKey}`;
  } else {
    // Fetch historical weather data for trips beyond 17 days
    const travelDate = new Date(arrival);
    const lastYearTravelDate = new Date(travelDate.setFullYear(travelDate.getFullYear() - 1));
    const startDate = formatDate(lastYearTravelDate);
    const endDate = formatDate(new Date(lastYearTravelDate.setDate(lastYearTravelDate.getDate() + 1)));

    weatherRequest = `${weatherbitURLhist}lat=${latitude}&lon=${longitude}&start_date=${startDate}&end_date=${endDate}&key=${weatherbitApiKey}`;
  }

  console.log("Weather request URL: ", weatherRequest);  // Debugging weather request URL

  try {
    const response = await fetch(weatherRequest);
    const weatherData = await response.json();
    console.log("Weather response: ", JSON.stringify(weatherData));

    const temperature = weatherData?.data?.[0]?.temp; 
    if (temperature !== undefined) {
      latestTrip.temperature = temperature;  // Assign temperature to the latest trip
      console.log(`Temperature: ${temperature}°C`);
    }

    return weatherData;
  } catch (error) {
    console.log('Error fetching weather data:', error);
  }
};

// Helper function to format dates to 'YYYY-MM-DD'
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');  // Ensure two-digit month
  const day = String(date.getDate()).padStart(2, '0');  // Ensure two-digit day
  return `${year}-${month}-${day}`;
};


// Function to retrieve city image from Pixabay API
const fetchCityImage = async () => {
  const latestTrip = userStore[userStore.length - 1];
  const { city, country } = latestTrip;
  const pixabayRequest = `${pixabayBaseURL}key=${pixabayApiKey}&q=${city}+${country}&image_type=photo&pretty=true`;

  try {
    const response = await fetch(pixabayRequest);

    if (!response.ok) {
      throw new Error('Failed to fetch city image from Pixabay');
    }

    const pixabayData = await response.json();

    if (!pixabayData.hits || pixabayData.hits.length === 0) {
      throw new Error('No image found for the city');
    }

    // Update the user store with the city image URL
    latestTrip.image = pixabayData.hits[0].webformatURL;
    console.log(`City image for ${city}, ${country} fetched from Pixabay`);

  } catch (error) {
    console.error('Error fetching city image from Pixabay:', error.message || error);
  }
};

// Function to retrieve country image if city image is unavailable
const fetchCountryImage = async () => {
  const latestTrip = userStore[userStore.length - 1];
  const { country } = latestTrip;
  const pixabayRequest = `${pixabayBaseURL}key=${pixabayApiKey}&q=${country}&image_type=photo&pretty=true`;

  try {
    const response = await fetch(pixabayRequest);

    if (!response.ok) {
      throw new Error('Failed to fetch country image from Pixabay');
    }

    const pixabayData = await response.json();

    if (!pixabayData.hits || pixabayData.hits.length === 0) {
      throw new Error('No image found for the country');
    }

    // Update the user store with the country image URL
    latestTrip.countryImage = pixabayData.hits[0].webformatURL;
    console.log(`Country image for ${country} fetched from Pixabay`);

  } catch (error) {
    console.error('Error fetching country image from Pixabay:', error.message || error);
  }
};


// POST route to add trip data
travelApp.post('/add', addNewTrip);

async function addNewTrip(req, res) {
  const newTripData = {
    date: req.body.date,
    city: req.body.city,
    daysLeft: req.body.daysLeft,
    arrival: req.body.arrival,
  };

  console.log('New trip data:', newTripData);

  userStore.push(newTripData);
  console.log('New trip added to userStore');

  await fetchGeoCoordinates();
  await fetchWeatherBit(); 
  await fetchCityImage();
  await fetchCountryImage();
  await fetchCountryDetails();    // Get country details from REST Countries API

  const finalTripData = {
    arrival: req.body.arrival,
    daysLeft: req.body.daysLeft,
    country: userStore[userStore.length - 1].country,
    temperature: userStore[userStore.length - 1].temperature,
    image: userStore[userStore.length - 1].image,
    countryImage: userStore[userStore.length - 1].countryImage,
    city: userStore[userStore.length - 1].city,
    capital: userStore[userStore.length - 1].capital,
    population: userStore[userStore.length - 1].population,
    currency: userStore[userStore.length - 1].currency,
    region: userStore[userStore.length - 1].region,
  };

  tripStore.push(finalTripData);

  // Send the updated tripStore data
  res.send(tripStore);
  console.log('Updated tripStore:', tripStore);
}

// GET route to return all trip data
travelApp.get('/all', fetchAllTrips);

function fetchAllTrips(req, res) {
  res.send(tripStore);
}

// DELETE route to remove a trip
travelApp.delete('/remove', deleteTrip);

function deleteTrip(req, res) {
  console.log('DELETE request received:', req.body);

  const { city } = req.body;
  if (!city) {
    return res.status(400).send({ message: 'City is required' });
  }

  const index = userStore.findIndex((trip) => trip.city === city);

  if (index !== -1) {
    userStore.splice(index, 1);
    tripStore.splice(index, 1);
    res.status(200).send({ message: 'Trip removed successfully', tripStore });
    console.log(`Trip to ${city} removed successfully`);
  } else {
    res.status(404).send({ message: 'Trip not found' });
    console.log(`Trip to ${city} not found`);
  }
}

module.exports = travelServer;
