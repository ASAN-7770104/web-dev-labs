import express from "express";
import axios from "axios";

const app = express();
const port = 3000;


const apiKey = process.env.OPENWEATHER_API_KEY;
const city = "New York";
const units = "metric";

app.get("/", async (req, res) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;

  try {
    const response = await axios.get(url);
    const weatherData = response.data;

    const temp = weatherData.main.temp;
    const description = weatherData.weather[0].description;
    const icon = weatherData.weather[0].icon;
    const imageURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    
    res.write(`<p>The weather in ${city} is ${temp}</p>`);
    res.write(`<p>The weather description ${description}</p>`);
    res.write(`<img src="${imageURL}">`);
    res.send();
  } catch (error) {
    console.error("Ошибка при запросе к API:", error.message);
    res.status(500).send("Не удалось получить данные о погоде.");
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});