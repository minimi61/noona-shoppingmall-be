const orderController = {};
const Order = require("../model/Order");
const User = require("../model/User");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;

    //재고 확ㅣ & 재고 업ㅔㅣ트
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );
    //재고가 충분하지 않는 아이템이 있었다면 에러던지기
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }
    //order만들기
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });
    await newOrder.save();
    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrder = async (req, res) => {
  try {
    const { userId } = req;
    const response = await Order.find({ userId }).populate({
      path: "items.productId",
      model: "Product",
    });
    res.status(200).json({ status: "success", orderList: response });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrderList = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    const response = await Order.find({}).populate({
      path: "items.productId",
      model: "Product",
    });
    res
      .status(200)
      .json({ status: "success", orderList: response, user: user.email });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = orderController;
