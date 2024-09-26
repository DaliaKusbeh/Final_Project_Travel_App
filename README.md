
# Travel Planner App

The **Travel Planner App** allows users to save their upcoming trips, view essential trip details, and remove trips as needed. The app interacts with third-party APIs to retrieve information such as city images, weather forecasts, and country details.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [APIs Used](#apis-used)
- [Available Scripts](#available-scripts)
- [Technologies](#technologies)
- [License](#license)

## Features

- **Add Trips**: Users can save their trip information, including the city and the travel date.
- **View Trips**: Trips are displayed with information such as the destination city, countdown days, expected weather, and additional details like the country capital, population, and currency.
- **Remove Trips**: Users can remove previously added trips.
- **Offline Caching**: The app supports offline caching via a service worker.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DaliaKusbeh/Final_Project_Travel_App.git
   ```

2. **Navigate to the project directory**:
   ```bash
   cd travel-planner-app
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```
**Notice that Node.js version is v20.15.1**

4. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following API keys:

   ```
   GEONAMES_USERNAME=&username=your_geonames_username
   WEATHERBIT_KEY=your_weatherbit_api_key
   PIXABAY_KEY=your_pixabay_api_key
   ```

5. **Build the app for production**:
   ```bash
   npm run build
   ```

6. **Start the server**:
   ```bash
   npm start
   ```

7. **Run in development mode**:
   ```bash
   npm run dev
   ```

## Usage

Once the server is running, open `http://localhost:8005` in your browser to access the Travel Planner app.

1. **Add a Trip**: Enter the destination city and select a travel date, then click on the "Save Trip" button.
2. **View Trip Details**: Your saved trip(s) will be displayed in the "Your Trips" section.
3. **Remove a Trip**: Click the "Remove Trip" button to delete the trip.

## APIs Used

The following APIs are used in this app:

1. **[GeoNames API](http://www.geonames.org/)**: Used to fetch city coordinates and country information.
2. **[Weatherbit API](https://www.weatherbit.io/)**: Retrieves weather forecasts or historical weather data for the specified location.
3. **[Pixabay API](https://pixabay.com/)**: Provides images of cities and countries.
4. **[REST Countries API](https://manage.countrylayer.com/)**: Provides detailed of countries being visited.

## Available Scripts

- **npm start**: Runs the server in production mode.
- **npm run dev**: Starts the development server with hot reloading.
- **npm run build**: Builds the app for production.
- **npm test**: Runs the test suite using Jest.

## Technologies

- **Node.js**: Backend server.
- **Express.js**: Web framework for Node.js.
- **Webpack**: Module bundler and asset pipeline.
- **Babel**: Transpiling ES6+ JavaScript code.
- **Sass**: CSS preprocessor for styling.
- **Jest**: JavaScript testing framework.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.