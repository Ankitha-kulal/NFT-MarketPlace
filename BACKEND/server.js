require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();  // ✅ Initialize app before defining routes

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Web3 Backend is running!");
});


app.post("/add-user", async (req, res) => {
  res.send("User added!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
