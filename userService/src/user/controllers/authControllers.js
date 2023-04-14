const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let refreshTokens = [];

const authController = {
  //REGISTER
  registerUser: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      const oldUser = await User.find({username: req.body.username})

      if (oldUser.length > 0) {
        return res.status(208).json({ message: "User already exists, please change the username", oldUser });
      }

      //Create new user
      const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
      });

      //Save user to DB
      const user = await newUser.save();
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: "Register user not found" });
    }
  },

  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "1s" }
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
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        return res.status(404).json("Incorrect username");
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
  }
};

module.exports = authController;