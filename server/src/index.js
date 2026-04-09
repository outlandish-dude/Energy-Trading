import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "./config.js";
import { seedInitialData } from "./seed/seedData.js";
import { initSimulationEngine, broadcastState } from "./services/simulationEngine.js";
import { marketplaceRouter } from "./routes/marketplace.js";
import { blockchainRouter } from "./routes/blockchain.js";
import { adminRouter } from "./routes/admin.js";
import { dashboardRouter } from "./routes/dashboard.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.clientOrigin,
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: config.clientOrigin,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "VoltShare Simulation API" });
});

app.use("/api/marketplace", marketplaceRouter);
app.use("/api/blockchain", blockchainRouter);
app.use("/api/admin", adminRouter);
app.use("/api/dashboard", dashboardRouter);

io.on("connection", async (socket) => {
  socket.emit("connected", { id: socket.id, at: new Date().toISOString() });
  await broadcastState();
});

async function bootstrap() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected");

    await seedInitialData();
    initSimulationEngine(io);

    httpServer.listen(config.port, () => {
      console.log(`VoltShare backend running at http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Server bootstrap failed", error);
    process.exit(1);
  }
}

bootstrap();
