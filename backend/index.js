const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const axios = require('axios');
// const { OpenAI } = require('openai');

// Load environment variables
require('dotenv').config();
const apiKey = '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';
// const openai = new OpenAI({ key: apiKey });

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

// Create a Mongoose schema
const userSchema = new mongoose.Schema({
  useremail: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  weatherData: [
    {
      date: { type: Date, default: Date.now },
      weatherText: { type: String },
      temperature: { type: Number },
    },
  ],
});

// Create a Mongoose model
const User = mongoose.model('User', userSchema);

// Setup nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// async function main() {
//   const completion = await openai.completions.create({
//     model: 'gpt-3.5-turbo',
//     messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
//   });

//   console.log(completion.choices[0].message);
// }

// main();
// Function to fetch current weather
const fetchWeather = async (location) => {
  const apiKey =
    process.env.OPENWEATHERMAP_API_KEY || '8ef53975ccbcf8945be2d3389e82cde0';
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    const weather = response.data;
    const weatherDescription = weather.weather[0].description;
    const temperature = weather.main.temp;
    return { description: weatherDescription, temperature, location };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw new Error('Unable to fetch the current weather.');
  }
};

// Function to send emails to all users
const sendWeatherUpdate = async () => {
  try {
    const users = await User.find();
    for (const user of users) {
      const weatherData = await fetchWeather(user.location);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.useremail,
        subject: 'Weather Update',
        text: `Hello, here is Your weather update for ${user.location}: \n\nDescription: ${weatherData.description}\nTemperature: ${weatherData.temperature}°C`,
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent to:', user.useremail);
    }
  } catch (err) {
    console.error('Error sending weather update emails:', err);
  }
};

// Schedule the task to run every 3 hours
cron.schedule('0 */3 * * *', async () => {
  console.log('Sending emails to all users...');
  try {
    await sendWeatherUpdate();
  } catch (err) {
    console.error('Error running cron job:', err);
  }
});

// Define routes
// GET route for testing
app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

// POST route to create a new user
app.post('/users', async (req, res) => {
  try {
    const { useremail, location } = req.body;

    // Validate the email and location fields
    if (!useremail || !location) {
      return res
        .status(400)
        .json({ message: 'Email and location are required' });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ useremail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Fetch weather data
    const weatherData = await fetchWeather(location);

    // Create a new user with weather data
    const newUser = new User({
      useremail,
      location,
      weatherData: [
        {
          weatherText: weatherData.description,
          temperature: weatherData.temperature,
        },
      ],
    });

    await newUser.save();

    // Send an email to the user with current weather
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: useremail,
      subject: 'Weather Information',
      text: `Hello, Weather for your location: ${location} :- \n\nWeather Report:\nDescription: ${weatherData.description}\nTemperature: ${weatherData.temperature}°C`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent to:', useremail);

    res.status(201).json(newUser);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(400).json({ message: err.message });
  }
});

// PUT route to update user's location
app.put('/users/:id/location', async (req, res) => {
  try {
    const { id } = req.params;
    const { location } = req.body;

    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.location = location;
    await user.save();

    const weatherData = await fetchWeather(location);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.useremail,
      subject: 'Weather Information',
      text: `Hello, Weather for your updated location: ${location} :- \n\nWeather Report:\nDescription: ${weatherData.description}\nTemperature: ${weatherData.temperature}°C`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent to:', user.useremail);

    res.status(200).json({ message: 'Location updated and email sent' });
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(400).json({ message: err.message });
  }
});

// GET route to get user's weather data for a given day
app.get('/users/:id/weather/:date', async (req, res) => {
  try {
    const { id, date } = req.params;
    const user = await User.findById(id);
    const weatherData = user.weatherData.filter(
      (data) => data.date.toDateString() === new Date(date).toDateString()
    );
    res.status(200).json(weatherData);
  } catch (err) {
    console.error('Error fetching weather data:', err);
    res.status(400).json({ message: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
