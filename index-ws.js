const express = require("express");
const server = require("http").createServer();
const app = express();

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

// Begin WebSocket

const WebSocket = require("ws").Server;

const wss = new WebSocket({ server: server });

process.on("SIGINT", () => {
  wss.clients.forEach((client) => {
    console.log("Websocket closed");
    client.close();
  });
  server.close(() => {
    console.log("Server closed");
    shutdownDB();
  });
});

wss.on("connection", (ws) => {
  const numClient = wss.clients.size;
  console.log("A new client connected. Total clients: " + numClient);

  wss.broadcast("Current visitors: " + numClient);

  if (ws.readyState === ws.OPEN) {
    ws.send("Welcome to my server!");
  }

  db.run(`INSERT INTO visitors (count, time) 
    VALUES (${numClient}, datetime('now'))`);

  ws.on("close", () => {
    wss.broadcast("Current visitors: " + numClient);
    console.log("A client disconnected");
  });
});

wss.broadcast = function (data) {
  wss.clients.forEach(function (client) {
    client.send(data);
  });
};

//End WebSocket

//Begin Database

const sqlite = require("sqlite3");
const db = new sqlite.Database(":memory:");

db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT  
    )`);
});

function getCount() {
  db.each(`SELECT * FROM visitors`, (err, row) => {
    if (row) {
      console.log(row);
    }
  });
}

function shutdownDB() {
  getCount();
  console.log("Shutting down database...");
  db.close();
}
