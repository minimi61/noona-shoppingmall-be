const User = require("../model/User");
const bcrypt = require("bcryptjs");

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
module.exports = authController;
