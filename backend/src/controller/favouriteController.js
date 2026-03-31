const db = require("../config/db");

exports.addFavourite = async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const [existing] = await db.query(
      "SELECT * FROM favourites WHERE user_id=? AND product_id=?",
      [req.user.id, product_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Already in favourites" });
    }

    await db.query(
      "INSERT INTO favourites (user_id, product_id) VALUES (?, ?)",
      [req.user.id, product_id]
    );

    res.json({ message: "Added to favourites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFavourites = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.id, f.product_id, p.name AS product_name, p.category, p.price
       FROM favourites f
       JOIN products p ON f.product_id = p.id
       WHERE f.user_id=?`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteFavourite = async (req, res) => {
  try {
    await db.query(
      "DELETE FROM favourites WHERE id=? AND user_id=?",
      [req.params.id, req.user.id]
    );

    res.json({ message: "Deleted from favourites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};