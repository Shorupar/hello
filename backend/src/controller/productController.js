const db = require("../config/db");
const fs = require("fs");
const path = require("path");

exports.getProducts = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.log("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, category, price } = req.body;

    if (!req.user || req.user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers allowed" });
    }

    if (!name || !category || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const image = req.file.filename;

    await db.query(
      "INSERT INTO products (name, category, price, image) VALUES (?,?,?,?)",
      [name, category, price, image]
    );

    res.json({ message: "Product added successfully" });

  } catch (err) {
    console.log("ADD PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers allowed" });
    }

    const productId = req.params.id;

    const [rows] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = rows[0];

    if (product.image) {
      const imgPath = path.join(__dirname, "../../uploads", product.image);

      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await db.query("DELETE FROM products WHERE id = ?", [productId]);

    res.json({ message: "Product deleted successfully" });

  } catch (err) {
    console.log("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};