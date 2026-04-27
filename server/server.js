const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Expense Tracker API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});