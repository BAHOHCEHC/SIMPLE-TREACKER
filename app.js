const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan"); // красиво логировать запросы на сервер
const cors = require("cors"); // для обработки корс запросов

const app = express();
app.use(bodyParser.urlencoded({ extended: true })); // парсит данные из запроса
app.use(bodyParser.json()); //генериит js объекты из json-a
app.use(morgan("dev"));
app.use(cors());
// app.use('/uploads', express.static('uploads'));

// РОУТЫ
const authRoutes = require("./routes/user");
const clientsRoutes = require("./routes/clients");
const taskRoutes = require("./routes/task");
// const statisticRoutes = require("./routes/statistic");

// Использование роутов
app.use("/api/clients", clientsRoutes); // http://localhost:5000/api/clients/Client B
app.use("/api/tasks", taskRoutes); // http://localhost:5000/api/tasks/getAll
app.use("/api/user", authRoutes); //http://localhost:5000/api/user/getUser
// app.use("/api/statistic", statisticRoutes); // ЗАПРОС НА данные по клиенту

module.exports = app;
