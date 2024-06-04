const productController = {};
const Product = require("../model/Product");

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;
    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });
    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    console.log("여기 에러?");
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProduct = async (req, res) => {
  try {
    const productList = await Product.find({});
    if (productList) {
      return res.status(200).json({ status: "success", productList });
    }
  } catch (error) {
    return res.status(400).json({ status: "error", error: error.message });
  }
};

module.exports = productController;
