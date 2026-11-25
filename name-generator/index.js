import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// Подключение статики (CSS) и парсера
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Массивы для генерации
const adjectives = ["generous", "wild", "black", "neon", "electric"];
const nouns = ["snowstorm", "tigers", "stars", "ninjas", "shadows"];

// Главная страница
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Обработка кнопки Generate
app.post("/submit", (req, res) => {
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  res.render("index.ejs", { 
    generatedName: `${randomAdj} ${randomNoun}` 
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});