const cors = require("cors");

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://smart-expense-tracker-kcyv.onrender.com"
  ],
  credentials: true
}));