import Product from "../models/productModel.js";

// GET all
export const getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// CREATE product
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      size: req.body.size,
      description: req.body.description,
      image: req.file?.path, // optional chaining
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  const data = req.body;

  if (req.file) {
    data.image = req.file.path;
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, data, {
    new: true,
  });

  res.json(updated);
};

// DELETE product
export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
