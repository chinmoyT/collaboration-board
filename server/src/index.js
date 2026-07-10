require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const boardRoutes = require("./routes/boards");
const { initSocket } = require("./socket");

const app = express();
const httpServer = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);

initSocket(httpServer);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
