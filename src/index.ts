import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { LEDController } from "./controllers/ledController";
import { createLEDRoutes } from "./routes/ledRoutes";
import { LEDService } from "./services/ledService";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const RASPBERRY_PI_HOST = process.env.RASPBERRY_PI_HOST || "localhost";
const RASPBERRY_PI_PORT = parseInt(process.env.RASPBERRY_PI_PORT || "8080");

// Middleware
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "LED Controller API Documentation",
  })
);

// Initialize services and controllers
const ledService = new LEDService(RASPBERRY_PI_HOST, RASPBERRY_PI_PORT);
const ledController = new LEDController(ledService);

// Routes
app.use("/api/led", createLEDRoutes(ledController));

// Health check
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   example: '2025-08-16T17:00:00.000Z'
 *                 raspberry_pi:
 *                   type: string
 *                   example: 'localhost:8080'
 */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    raspberry_pi: `${RASPBERRY_PI_HOST}:${RASPBERRY_PI_PORT}`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LED Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(
    `📡 Connecting to Raspberry Pi at ${RASPBERRY_PI_HOST}:${RASPBERRY_PI_PORT}`
  );
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
