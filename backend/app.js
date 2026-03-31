require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const signupRoutes = require("./src/routes/signupRoutes");
const loginRoutes = require("./src/routes/loginRoutes");
const favouriteRoutes = require("./src/routes/favouriteRoutes");
const userRoutes = require("./src/routes/userRoutes");
const productRoutes = require("./src/routes/productRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/signup", signupRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/favourites", favouriteRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);

app.get('/', (req, res) => {
    res.send('Server Started...')
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});