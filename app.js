require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");   // 👈 NEW
const db = require("./db");
app.get("/", (req, res) => {
  res.send("Order Service is running successfully 🚀");
});

app.listen(5002, () => {
  console.log("Order Service running on port 5002");
});
const app = express();
const PORT = 5002;

// ========== CORS ==========
const allowedOrigins = [
  "https://amznpro.online",
  "https://www.amznpro.online",
  "http://localhost:3000",
  "https://localhost:3000",
  "https://api.amznpro.online",
  "http://127.0.0.1:3000",
  "https://127.0.0.1:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    console.log(`Request origin: ${origin}`);

    // Allow requests with no origin (curl, Postman, direct browser URL)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      console.log(`CORS allowed for origin: ${origin}`);
      return callback(null, true);
    } else {
      console.log(`CORS blocked for origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Private Network Access header
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  next();
});

app.options("*", cors());
app.use(express.json());

// 👇 COMPRESSION MIDDLEWARE (after json, before routes)
app.use(compression());

// ========== DATABASE TEST ==========
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ MySQL Database connected (Order Service)");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
  }
})();

// ========== ROUTES ==========
app.get("/orders", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM orders");
    res.json(rows);
  } catch (err) {
    console.error("ORDER FETCH ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

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

app.get("/health", (req, res) => {
  res.status(200).send("Order Service is healthy");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Order Service running on port ${PORT}`);
});
