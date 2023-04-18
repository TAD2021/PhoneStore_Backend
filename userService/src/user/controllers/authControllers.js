const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

let refreshTokens = [];

const authController = {
  //REGISTER
  registerUser: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      const user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(409).json({
          message: "Email already exists, please choose another one",
        });
      }

      //Create new user
      const newUser = new User({
        email: req.body.email,
        password: hashed,
        name: req.body.name,
        address: '',
        specificAddress: '',
        phone: '',
      });

      //Save user to DB
      const savedUser = await newUser.save();
      return res.status(200).json(savedUser);
    } catch (err) {
      console.log("Error registering user:", err);
      return res.status(500).json({ message: "Register user not found" });
    }
  },

  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "10s" }
    );
  },

  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "365d" }
    );
  },

  //LOGIN
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json("Incorrect email");
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(404).json("Incorrect password");
      }
      if (user && validPassword) {
        //Generate access token
        const accessToken = authController.generateAccessToken(user);
        //Generate refresh token
        const refreshToken = authController.generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        //STORE REFRESH TOKEN IN COOKIE
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        const { password, ...others } = user._doc;
        return res.status(200).json({ ...others, accessToken });
      }
    } catch (err) {
      res.status(500).json({ message: "Login user not found" });
    }
  },
  updateUser: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      //Generate access token
      const accessToken = authController.generateAccessToken(user);
      //Generate refresh token
      const refreshToken = authController.generateRefreshToken(user);
      refreshTokens.push(refreshToken);
      //STORE REFRESH TOKEN IN COOKIE
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      const { password, ...others } = user._doc;
      return res.status(200).json({ ...others, accessToken });
    } catch (error) {
      res.status(500).json({ message: "Update a user not found" });
    }
  },

  requestRefreshToken: async (req, res) => {
    //Take refresh token from user
    const refreshToken = req.cookies.refreshToken;
    //Send error if token is not valid
    if (!refreshToken) return res.status(401).json("You're not authenticated");
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json("Refresh token is not valid");
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
      if (err) {
        console.log(err);
      }
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
      //create new access token, refresh token and send to user
      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateRefreshToken(user);
      refreshTokens.push(newRefreshToken);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      return res.status(200).json({
        accessToken: newAccessToken,
      });
    });
  },

  //LOG OUT
  logOut: async (req, res) => {
    //Clear cookies when user logs out
    refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
    res.clearCookie("refreshToken");
    return res.status(200).json("Logged out successfully!");
  },
  changePassword: async(req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id });
      if (!user) {
        return res.status(404).json("User not exist");
      }
      const validPassword = await bcrypt.compare(
        req.body.oldPassword,
        user.password
      );
      if (!validPassword) {
        return res.status(404).json("Incorrect password");
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.newPassword, salt);

      user.password = hashed;

      user.save();

      res.status(200).json({ message: "Change password successfully" })
    } catch (err) {
      res.status(500).json({ message: "User not found" });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const token = jwt.sign(
        {
          id: user.id,
        },
        process.env.RESET_PASSWORD_KEY,
        { expiresIn: "30m" }
      );
      user.resetLink = token;
      await user.save();
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      const resetPasswordUrl = `http://localhost:3000/users/resetpassword/${token}`;

      const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: user.email,
        subject: "Đặt lại mật khẩu",
        html: `
          <div style="background-color: #f2f2f2; padding: 20px;">
            <h2 style="color: #007bff;">Xin chào ${user.name}!</h2>
            <p>Bạn đã yêu cầu đặt lại mật khẩu của tài khoản của mình.</p>
            <p>Vui lòng sử dụng liên kết sau để đặt lại mật khẩu:</p>
            <div style="padding: 10px; background-color: white; text-align: center;">
              <a href="${resetPasswordUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px; text-decoration: none;">Đặt lại mật khẩu</a>
            </div>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            <p>Trân trọng,</p>
            <p>Đội ngũ quản trị viên</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: "Send email not found" });
        } else {
          return res
            .status(200)
            .json({ message: "Password reset email has been sent" });
        }
      });
    } catch (error) {
      console.log("Email sent: ", error);
      res.status(500).json({ message: "Forgot Password not found" });
    }
  },

  resetPassword: async (req, res) => {
    const { newPassword, token } = req.body;
    try {
      const payload = jwt.verify(token, process.env.RESET_PASSWORD_KEY);

      console.log(payload)

      const user = await User.findOne({ _id: payload.id });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.resetLink !== token) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      user.resetLink = null;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: user.email,
        subject: "Mật khẩu của bạn đã được thay đổi",
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; font-size: 16px;">
            <h2>Xin chào ${user.name}!</h2>
            <p>Chúc mừng bạn! Mật khẩu của tài khoản của bạn đã được thay đổi thành công.</p>
            <p>Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức để được hỗ trợ.</p>
            <p>Trân trọng,</p>
            <p>Đội ngũ quản trị viên</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        return res.json({ message: "Password has been successfully changed" });
      });
    } catch (err) {
      return res.status(500).json({ message: "Reset password not found" });
    }
  },
};

module.exports = authController;