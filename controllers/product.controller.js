const productController = {};
const Product = require("../model/Product");
const PAGE_SIZE = 4;
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
      tag,
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
      tag,
    });
    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProduct = async (req, res) => {
  try {
    const { page, name, menu } = req.query;
    const cond = {
      isDeleted: false,
      ...((name || menu) && {
        ...(name && { name: { $regex: name, $options: "i" } }),
        ...(menu && { tag: { $regex: `\\b${menu}\\b`, $options: "i" } }),
      }),
    };

    let query = Product.find(cond);
    let response = { status: "success" };
    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      const totalItemNum = await Product.find(cond).count();
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }
    const productList = await query.exec();
    response.data = productList;
    console.log("response", response);
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
      tag,
    } = req.body;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      {
        sku,
        name,
        size,
        image,
        category,
        description,
        price,
        stock,
        status,
        tag,
      },
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

productController.checkStock = async (item) => {
  //내가 사려는 아이템 재고 정보 들고오기
  const product = await Product.findById(item.productId);
  //내가 사려는 아이템 qty, 재고 비교
  if (product.stock[item.size] < item.qty) {
    //재고 불충분하면 불충분 메시지와 함께 데이터 반환
    return {
      isVerfy: false,
      message: `${product.name}의 ${item.size}재고가 부족합니다`,
    };
  }
  const newStock = { ...product.stock };
  newStock[item.size] -= item.qty;
  product.stock = newStock;

  await product.save();
  //충분하다면 재고에서 qty 빼고 성공
  return { isVerfy: true };
};

productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = [];
  //재고 확인
  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item);
      if (!stockCheck.isVerfy) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
      return;
    })
  );
  return insufficientStockItems;
};

module.exports = productController;
