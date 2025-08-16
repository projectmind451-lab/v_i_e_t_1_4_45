import Product from "../models/product.model.js";

// add product :/api/product/add
export const addProduct = async (req, res) => {
  try {
    const { name, price, offerPrice, description, category, unit, unitValue } = req.body;
    // const image = req.files?.map((file) => `/uploads/${file.filename}`);
    const image = req.files?.map((file) => file.filename);
    if (
      !name ||
      !price ||
      !offerPrice ||
      !description ||
      !category ||
      !image ||
      image.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields including images are required",
      });
    }

    const parsedUnitValue = typeof unitValue !== 'undefined' && unitValue !== null && unitValue !== ''
      ? Number(unitValue)
      : undefined;
    if (parsedUnitValue !== undefined && !(parsedUnitValue > 0)) {
      return res.status(400).json({ success: false, message: "unitValue must be a positive number" });
    }

    const product = new Product({
      name,
      price,
      offerPrice,
      description,
      category,
      unit: unit && ["kg","gm","liter"].includes(unit) ? unit : undefined,
      unitValue: parsedUnitValue,
      image,
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      product: savedProduct,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error in addProduct:", error);

    return res
      .status(500)
      .json({ success: false, message: "Server error while adding product" });
  }
};

// delete product : /api/product/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return res.status(500).json({ success: false, message: "Server error while deleting product" });
  }
};

// get products :/api/product/get
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// get single product :/api/product/id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// change stock  :/api/product/stock
// Change stock availability
export const changeStock = async (req, res) => {
  const { productId, inStock } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { inStock },
      { new: true } // returns updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Send back updated product so frontend can update without refresh
    res.json({
      success: true,
      message: `Stock status updated to ${inStock ? "In Stock" : "Out of Stock"}`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating stock status:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// update product : /api/product/update/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, offerPrice, description, category, inStock, unit, unitValue } = req.body;
    const image = req.files?.map((file) => file.filename);

    // Find existing product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Update fields only if they are provided
    if (name) product.name = name;
    if (price) product.price = price;
    if (offerPrice) product.offerPrice = offerPrice;
    if (description) product.description = description;
    if (category) product.category = category;
    if (typeof inStock !== "undefined") product.inStock = inStock;
    if (unit && ["kg","gm","liter"].includes(unit)) product.unit = unit;
    if (typeof unitValue !== 'undefined' && unitValue !== null && unitValue !== '') {
      const v = Number(unitValue);
      if (!(v > 0)) {
        return res.status(400).json({ success: false, message: "unitValue must be a positive number" });
      }
      product.unitValue = v;
    }
    if (image && image.length > 0) product.image = image; // overwrite if new images uploaded

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      product: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).json({ success: false, message: "Server error while updating product" });
  }
};

