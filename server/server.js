import express from "express";
import { createServer } from "http";
import router from "./routes/authRoutes.js";
import connectToDB from "./config/db.js";
import setupWebSocketServer from "./utils/ws.js";
import cors from "cors";

const port = 8080;

const app = express();
const server = createServer(app);
setupWebSocketServer(server);

// connectToDB
connectToDB();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api', router);

// Tiny health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 404 for all other HTTP requests
app.use((req, res) => {
  res.status(404).end();
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
