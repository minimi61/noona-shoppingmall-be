const Cart = require("../model/Cart");

const cartController = {};
cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    //유저로 카트 찾기
    let cart = await Cart.findOne({ userId });
    //유저 카트가 없다면 만들어주기
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }

    //이미 카트에 들어가있는지? productId, size 둘다 체크
    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size == size
    );
    //productId mongooseObjId는 string이 아님equals로 비교해야함

    //그렇다면 에러('이미 아이템이 있습니다')
    if (existItem) {
      throw new Error("아이템이 이미 카트에 담겨 있습니다!");
    }
    //카트 아이템 추가
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    //카트함에 수량 추가
    res
      .status(200)
      .json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};
cartController.getCart = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });

    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const cart = await Cart.findOne({ userId });
    cart.items = cart.items.filter((item) => !item._id.equals(id));

    await cart.save();
    res.status(200).json({ status: 200, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.updateCart = async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.params;
    const { qty } = req.body;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Cart",
      },
    });
    const findCartIndex = cart.items.findIndex((item) => item._id.equals(id));
    if (findCartIndex === -1) throw new Error("Can not find item");

    cart.items[findCartIndex].qty = qty;
    await cart.save();
    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};
cartController.getCartQty = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId: userId });
    res.status(200).json({ status: 200, qty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};
module.exports = cartController;
