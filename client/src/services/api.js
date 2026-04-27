import axios from "axios";

const API = axios.create({
  baseURL: "https://smart-expense-tracker-kcyv.onrender.com/api",
});

export default API;