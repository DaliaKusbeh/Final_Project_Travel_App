// Function to update the UI with trip data
const refreshUI = async () => {
  try {
    const response = await fetch('http://localhost:8005/all');
    let tripData = await response.json();
    console.log("Trip Data (UI):", tripData);

    const tripListElem = document.getElementById('tripList'); // Get the trip list container

    // Clear the current trip list before updating
    tripListElem.innerHTML = '';

    // If no trips, show a message
    if (tripData.length === 0) {
      tripListElem.innerHTML = '<div>No trips planned</div>';
      return;
    }

    // Sort the trip data by `daysLeft` (ascending order)
    tripData.sort((a, b) => a.daysLeft - b.daysLeft);

    // Loop through each trip and dynamically add it to the UI
    tripData.forEach((trip, index) => {
      const tripElem = document.createElement('div');
      tripElem.classList.add('trip-entry');
      tripElem.setAttribute('data-index', index); // Store the index for deletion purposes

      tripElem.innerHTML = `
        <div class="trip-info">
        <div class="trip-image">
          <img src="${trip.image || trip.countryImage || 'default.jpg'}" alt="Trip Image">
        </div>
          <h3>You are going to ${trip.city}, ${trip.country || 'Unknown'}</h3>
          <p>Your travel date is ${trip.arrival}</p>
          <p>There are ${trip.daysLeft} days left until your trip</p>
          <p>The expected weather for then is ${trip.temperature || 'Not available'}°C</p>
          <p>Capital: ${trip.capital || 'Not available'}</p>
          <p>Population: ${trip.population || 'Not available'}</p>
          <p>Currency: ${trip.currency || 'Not available'}</p>
          <p>Region: ${trip.region || 'Not available'}</p>
        </div>
        <button class="remove-btn" onclick="deleteTrip(${index})">Remove Trip</button>
      `;

      tripListElem.appendChild(tripElem); // Append the new trip block to the trip list
    });

  } catch (error) {
    console.error('Error refreshing UI:', error);
  }
};

// Function to remove a trip
window.deleteTrip = async (index) => {
  // Use a query selector to accurately get the city name from the trip entry
  const tripElem = document.querySelectorAll('.trip-entry')[index]; 
  const cityText = tripElem.querySelector('h3').textContent;  // Extract the full trip description
  
  const city = cityText.match(/going to (\w+),/)[1];  

  console.log(`Deleting trip to: ${city}`);  
  
  try {
    const response = await fetch('http://localhost:8005/remove', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ city }),  // Send the city name in request body
    });

    if (!response.ok) {
      throw new Error('Failed to remove trip');
    }

    const result = await response.json();
    console.log(result.message);

    // Refresh UI after the trip is removed
    await refreshUI();

  } catch (error) {
    console.error('Error removing trip:', error);
  }
};


// Function to handle the form submission
function formSubmission() {
  const addTripURL = 'http://localhost:8005/add';

  // Create a new date instance dynamically with JS
  let today = new Date();
  let month = today.getMonth() + 1;
  let formattedDate = today.getDate() + '.' + month + '.' + today.getFullYear();

  // Add an event listener to the Save Trip button
  document.getElementById('generate').addEventListener('click', executeAction);

  function executeAction(event) {
    event.preventDefault();

    const city = document.getElementById('city').value;
    const travelDate = document.getElementById('arrivalDate').value;
    const tripDate = new Date(travelDate);
    const currentDate = new Date();

    // Validate that both city and travel date are provided
    if (!city || !travelDate) {
      alert("Please enter both the city and the travel date to save your trip.");
      return;
    }

    // Ensure the selected travel date is in the future
    if (tripDate <= currentDate) {
      alert("The travel date must be a future date.");
      return;
    }

    const timeDifference = tripDate.getTime() - currentDate.getTime();
    const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    const tripData = {
      date: formattedDate,
      arrival: travelDate,
      daysLeft: daysLeft,
      city: city,
    };

    // Send the trip data to the server
    submitTrip(addTripURL, tripData);
  }

  // Function to send trip data to the server
  const submitTrip = async (url = '', data = {}) => {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    try {
      const tripData = await fetch('http://localhost:8005/all');
      try {
        const newTripData = await tripData.json();
        refreshUI();
        return newTripData;
      } catch (error) {
        console.log("Error parsing response data:", error);
      }
    } catch (error) {
      console.log("Error submitting trip:", error);
    }
  };
}

export { refreshUI, formSubmission };
