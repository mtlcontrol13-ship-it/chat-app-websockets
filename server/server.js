import express from "express";
import { createServer } from "http";
import router from "./routes/authRoutes.js";
import connectToDB from "./config/db.js";
import setupWebSocketServer from "./utils/ws.js";

const port = 8080;

const app = express();
const server = createServer(app);
setupWebSocketServer(server);

// connectToDB
connectToDB();

app.use(express.json());
// Tiny health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
// 404 for all other HTTP requests
app.use((req, res) => {
  res.status(404).end();
});
app.use('/api', router);

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
