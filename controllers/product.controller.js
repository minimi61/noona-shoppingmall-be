const productController = {};
const Product = require("../model/Product");
const PAGE_SIZE = 3;
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
    const { page, name } = req.query;
    //AHA! isDeleted: false 인것들만 삭제되어도 보여지도록
    const cond = name
      ? { name: { $regex: name, $options: "i" }, isDeleted: false }
      : { isDeleted: false };
    let query = Product.find(cond);
    let response = { status: "success" };
    if (page) {
      //skip할 데이터
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      //최종 몇개 페이지
      const totalItemNum = await Product.find(cond).count();
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }
    const productList = await query.exec();
    response.data = productList;
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ status: "error", error: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
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
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { sku, name, size, image, category, description, price, stock, status },
      { new: true }
    );
    if (!product) throw new Error("item doesnt exist");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    return res.status(400).json({ status: "error", error: error.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDeleted: true }
    );
    if (!product) throw new Error("item doesnt exist");
    res.status(200).json({ status: "success" });
  } catch (error) {
    return res.status(400).json({ status: "error", error: error.message });
  }
};
productController.getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById({ _id: productId });
    if (!product) throw new Error("item doesnt exist");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    return res.status(400).json({ status: "error", error: error.message });
  }
};

module.exports = productController;
