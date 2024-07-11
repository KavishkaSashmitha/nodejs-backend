# Node.js Weather App Backend

This is a Node.js backend application for a weather app. It fetches weather data from an external API and provides endpoints for retrieving weather information.

## Features

- Fetches weather data from an external API
- Provides endpoints for current weather and forecasts
- Error handling for API requests

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/).

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

## Setup

1. Create a `.env` file in the root of your project and add your API key and other configurations:

    ```env
    WEATHER_API_KEY=your-weather-api-key
    ```

2. Update `config.js` (or similar configuration file) with your API key if necessary.

## Usage

1. Start the server:

    ```sh
    npm start
    ```

2. The server will run on `http://localhost:3000` by default. You can change the port in the configuration file.

## Endpoints

- **GET** `/weather/current?city={cityName}`: Get current weather for the specified city.
- **GET** `/weather/forecast?city={cityName}`: Get weather forecast for the specified city.

## Deployment

This application is deployed on Replit and Vercel.

### Replit

You can access the Replit deployment [here]([https://replit.com/@your-username/your-repo-name](https://replit.com/join/fdffwgsakh-kavishkasashmit)).

### Vercel

You can access the Vercel deployment [here](https://your-repo-name.vercel.app).

## Technologies Used

- Node.js
- Express
- Axios (for making API requests)
- dotenv (for managing environment variables)
- Replit (for deployment)
- Vercel (for deployment)

## Contributing

If you want to contribute to this project, follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Make your changes and commit them: `git commit -m 'Add feature-name'`.
4. Push to the branch: `git push origin feature-name`.
5. Submit a pull request.

## License

This project is licensed under the MIT License.
