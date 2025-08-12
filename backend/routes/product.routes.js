import express from "express";
import { authSeller } from "../middlewares/authSeller.js";
import {
  addProduct,
  changeStock,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controller/product.controller.js";
import { upload } from "../config/multer.js";
import Product from "../models/product.model.js";

const router = express.Router();

// Add a new product
router.post("/add-product", authSeller, upload.array("image", 4), addProduct);

// Get all products
router.get("/list", getProducts);

// Get product by ID
router.get("/:id", getProductById);

// Toggle stock availability
router.post("/stock", authSeller, changeStock);

// Update product (including images)
router.put(
  "/update/:id",
  authSeller,
  upload.array("image", 4),
  updateProduct
);

// Delete product
router.delete("/:id", authSeller, deleteProduct);

export default router;
















// import express from "express";

// import { authSeller } from "../middlewares/authSeller.js";
// import {
//   addProduct,
//   changeStock,
//   getProductById,
//   getProducts,
//   updateProduct,
// } from "../controller/product.controller.js";
// import { upload } from "../config/multer.js";
// import Product from "../models/product.model.js";


// const router = express.Router();

// router.post("/add-product", authSeller, upload.array("image", 4), addProduct);
// router.get("/list", getProducts);
// router.get("/id", getProductById);
// router.post("/stock", authSeller, changeStock);
// router.put(
//   "/update/:id",
//   authSeller,
//   upload.array("image", 4), // allow up to 4 new images
//   updateProduct
// );

// router.put("/:id", async (req, res) => {
//   try {
//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true } // returns the updated doc
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.json(updatedProduct);
//   } catch (error) {
//     console.error("Error updating product:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * POST /api/product/stock
//  * Toggle stock availability
//  * Body: { productId: "...", inStock: true/false }
//  */
// router.post("/stock", async (req, res) => {
//   const { productId, inStock } = req.body;

//   try {
//     const updatedProduct = await Product.findByIdAndUpdate(
//       productId,
//       { inStock },
//       { new: true }
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.json({
//       message: `Product stock status updated to ${inStock}`,
//       product: updatedProduct
//     });
//   } catch (error) {
//     console.error("Error updating stock status:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;
