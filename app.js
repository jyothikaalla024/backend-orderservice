require("dotenv").config();

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5002;

// ================= CORS =================
const allowedOrigins = [
  "https://amznpro.online",
  "https://www.amznpro.online",
  "https://api.amznpro.online",
  "http://localhost:3000",
  "https://localhost:3000",
  "http://127.0.0.1:3000",
  "https://127.0.0.1:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Request Origin:", origin);

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed for this origin"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.options("*", cors());

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(compression());

// Private Network Access Header
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

// ================= ROOT ROUTE =================
app.get("/", (req, res) => {
  res.send("🚀 Order Service is running successfully");
});

// ================= HEALTH CHECK =================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "order-service"
  });
});

// ================= DATABASE TEST =================
async function testDB() {
  try {
    await db.query("SELECT 1");
    console.log("✅ MySQL Database connected (Order Service)");
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
  }
}

testDB();

// ================= ROUTES =================

// GET all orders
app.get("/orders", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM orders");
    res.json(rows);
  } catch (error) {
    console.error("ORDER FETCH ERROR:", error.message);
    res.status(500).json({ error: "Database error" });
  }
});

// CREATE new order
app.post("/orders", async (req, res) => {
  const { user_id, product_name, amount } = req.body;

  if (!user_id || !product_name || !amount) {
    return res.status(400).json({
      error: "user_id, product_name and amount are required"
    });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO orders (user_id, product_name, amount) VALUES (?, ?, ?)",
      [user_id, product_name, amount]
    );

    res.status(201).json({
      message: "Order created successfully",
      orderId: result.insertId
    });
  } catch (error) {
    console.error("ORDER CREATE ERROR:", error.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ================= START SERVER =================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Order Service running on port ${PORT}`);
});
