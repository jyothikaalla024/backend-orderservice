require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");   // make sure this uses mysql2/promise

const app = express();
const PORT = 5002;  // Force port 5002

// ========== CORS ==========
app.use(cors({
  origin: [
    'https://amznpro.online',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:8080',
    'http://localhost:8080'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ========== DATABASE TEST ==========
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ MySQL Database connected (Order Service)");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
  }
})();

// ========== ROUTES ==========

// Get all orders
app.get("/orders", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM orders");
    res.json(rows);
  } catch (err) {
    console.error("ORDER FETCH ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Create new order (Optional but recommended)
app.post("/orders", async (req, res) => {
  const { user_id, product_name, amount } = req.body;

  if (!user_id || !product_name || !amount) {
    return res.status(400).json({ error: "All fields required" });
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

  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ========== HEALTH CHECK ==========
app.get("/health", (req, res) => {
  res.status(200).send("Order Service is healthy");
});

// ========== START SERVER ==========
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Order Service running on port ${PORT}`);
});
