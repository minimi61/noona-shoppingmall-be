const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SCREET_KEY = process.env.JWT_SCREET_KEY;
const authController = {};

authController.loginWithEmail = async (req, res) => {
  try {
    console.log("여기는 들어오나");
    const { email, password } = req.body;
    const user = await User.findOne({ email }, "-createAt -updateAt -__v");
    if (user) {
      const isMatch = await bcrypt.compareSync(password, user.password);
      if (isMatch) {
        const token = await user.generateToken();
        console.log("to,", token);
        return res.status(200).json({ status: "success", user, token });
      }
    }
    throw new Error("아이디 또는 비밀번호가 일치하지 않습니다");
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) throw new Error("Token not found");
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SCREET_KEY, (error, payload) => {
      if (error) {
        throw new Error("invalid token");
      }
      req.userId = payload._id;
    });
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(400).json({ status: "fail", error: error.message });
  }
};
module.exports = authController;
