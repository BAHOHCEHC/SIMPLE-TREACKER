const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const DATA_PATH = path.join(__dirname, "../DB/tasks.json");
// const errorHandler = require("../utils/errorHandler");


// Получить все задачи
// http://localhost:5000/api/tasks/getAll
router.get("/getAll", (req, res) => {
  fs.readFile(DATA_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });
    res.json(JSON.parse(data));
  });
});

// Получить задачи по имени клиента
// http://localhost:5000/api/tasks/Client A
router.get("/:clientName", (req, res) => {
  const clientName = req.params.clientName.replace(/\s+/g, "");
  fs.readFile(DATA_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });

    const tasks = JSON.parse(data);
    const filteredTasks = tasks.filter(
      (task) => task.clientName.replace(/\s+/g, "") === clientName
    );

    if (filteredTasks.length === 0) {
      return res
        .status(404)
        .json({ message: "No tasks found for this client" });
    }
    res.json(filteredTasks);
  });
});

// Создать новую задачу
// http://localhost:5000/api/tasks/
// {
//   "id": 1737104526174,
//   "name": "Task 111",
//   "cost": 15,
//   "clientName": "Client A",
//   "clientId": "63f1d6f5e3b0b4d5c8a1a23b",
//   "startTime": "2011-11-01T09:00:00Z",
//   "endTime": "2011-11-01T11:00:00Z",
//   "startDay": "2011-11-01",
//   "wastedTime": 2,
//   "totalMoney": 30,
//   "user": "63f1d6f5e3b0b4d5c8a1a23b",
//   "formatTime": "11 hours"
// }
router.post("/", (req, res) => {
  fs.readFile(DATA_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });

    const tasks = JSON.parse(data);
    const newTask = { id: Date.now(), ...req.body };
    tasks.push(newTask);

    fs.writeFile(DATA_PATH, JSON.stringify(tasks, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing data" });
      res.status(201).json(newTask);
    });
  });
});

// Обновить задачу по ID
// http://localhost:5000/api/tasks/12445457567567
router.patch("/:id", (req, res) => {
  fs.readFile(DATA_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });

    const tasks = JSON.parse(data);
    const taskIndex = tasks.findIndex(
      (task) => task.id === parseInt(req.params.id)
    );

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };

    fs.writeFile(DATA_PATH, JSON.stringify(tasks, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing data" });
      res.status(200).json(tasks[taskIndex]);
    });
  });
});

// http://localhost:5000/api/tasks/12312423534
// Удалить задачу по ID
router.delete("/:id", (req, res) => {
  fs.readFile(DATA_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });

    let tasks = JSON.parse(data);
    tasks = tasks.filter((task) => task.id !== parseInt(req.params.id));

    fs.writeFile(DATA_PATH, JSON.stringify(tasks, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing data" });
      res.status(200).json({ message: "Task deleted" });
    });
  });
});

module.exports = router;
