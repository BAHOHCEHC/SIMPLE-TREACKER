const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const errorHandler = require("../utils/errorHandler");
const CLIENTS_DATA_PATH = path.join(__dirname, "../DB/clients.json");
const TASKS_DATA_PATH = path.join(__dirname, "../DB/tasks.json");

// Универсальная обработка ошибок

// Чтение данных из файла
const readData = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(JSON.parse(data));
    });
  });
};

// Запись данных в файл
const writeData = (filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Чтение всех клиентов
router.get("/", (req, res) => {
  fs.readFile(CLIENTS_DATA_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });
    res.json(JSON.parse(data));
  });
});

// Поиск клиента по имени
router.get("/:name", (req, res) => {
  const clientName = req.params.name.replace(/\s+/g, "");
  fs.readFile(CLIENTS_DATA_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });

    const clients = JSON.parse(data);
    const client = clients.find(
      (client) => client.name.replace(/\s+/g, "") === clientName
    );

    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  });
});

// Добавление нового клиента
router.post("/", (req, res) => {
  fs.readFile(CLIENTS_DATA_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });

    const clients = JSON.parse(data);
    const newClient = { id: Date.now(), ...req.body };
    clients.push(newClient);

    fs.writeFile(CLIENTS_DATA_PATH, JSON.stringify(clients, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing data" });
      res.status(201).json(newClient);
    });
  });
});

// Удаление клиента
router.delete("/:id", async (req, res) => {
  try {
    const clients = await readData(CLIENTS_DATA_PATH);
    const tasks = await readData(TASKS_DATA_PATH);

    const updatedClients = clients.filter((client) => {
      client.name !== req.params.id;
    });
    const updatedTasks = tasks.filter((task) => {
      task.clientName !== req.params.id;
    });

    await writeData(CLIENTS_DATA_PATH, updatedClients);
    await writeData(TASKS_DATA_PATH, updatedTasks);

    res.status(200).json({ message: "Client and associated tasks deleted" });
  } catch (e) {
    errorHandler(res, e);
  }
});

// Обновление клиента
router.patch("/:id", (req, res) => {
  fs.readFile(CLIENTS_DATA_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });

    const clients = JSON.parse(data);
    const clientIndex = clients.findIndex(
      (client) => client.id === parseInt(req.params.id)
    );

    if (clientIndex === -1)
      return res.status(404).json({ message: "Client not found" });

    clients[clientIndex] = { ...clients[clientIndex], ...req.body };

    fs.writeFile(CLIENTS_DATA_PATH, JSON.stringify(clients, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing data" });
      res.status(200).json(clients[clientIndex]);
    });
  });
});

// Обновление архивного времени клиента
router.patch("/:id/achivetime", (req, res) => {
  fs.readFile(CLIENTS_DATA_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });

    const clients = JSON.parse(data);
    const clientIndex = clients.findIndex(
      (client) => client.id === parseInt(req.params.id)
    );

    if (clientIndex === -1)
      return res.status(404).json({ message: "Client not found" });

    const additionalArchivedTime = req.body.archivedTime || 0;
    clients[clientIndex].archivedTime += additionalArchivedTime;

    fs.writeFile(CLIENTS_DATA_PATH, JSON.stringify(clients, null, 2), (err) => {
      if (err) return res.status(500).json({ message: "Error writing data" });
      res.status(200).json(clients[clientIndex]);
    });
  });
});

module.exports = router;
