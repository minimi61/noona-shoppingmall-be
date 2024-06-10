const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");
const Product = require("./Product");
const Cart = require("./Cart");
const orderSchema = Schema(
  {
    shipTo: { type: String, required: true },
    contact: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    userId: { type: mongoose.ObjectId, ref: User },
    status: { type: String, default: "active" },
    items: [
      {
        productId: { type: mongoose.ObjectId, ref: Product },
        size: { type: String, required: true },
        qty: { type: Number, default: 1 },
      },
    ],
    orderNum: { type: String },
  },
  { timeStams: true }
);

orderSchema.method.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.updateAt;
  delete obj.createAt;
  return obj;
};

orderSchema.post("save", async function () {
  const cart = await Cart.findOne({ userId: this.userId });
  cart.items = [];
  await cart.save();
});
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
