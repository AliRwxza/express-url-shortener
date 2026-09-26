const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const responseHandler = require("../helper/responseHandler");
const { StatusCodes } = require("http-status-codes");

const SALT_ROUNDS = 10;

async function login(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return responseHandler(
      res,
      StatusCodes.BAD_REQUEST,
      {message: "Username or password not provided"}
    );
  }
  try {
    const user = await User.findOne({
      attributes: [
        "id",
        "username",
        "passwordHash"
      ],
      where: {username}
    });
    if (!user) {
      return responseHandler(
        res,
        StatusCodes.UNAUTHORIZED,
        {message: "Incorrect username"}
      );
    }
    const passwordCheck = await bcrypt.compare(password, user.passwordHash);
    if (!passwordCheck) {
      return responseHandler(
        res,
        StatusCodes.UNAUTHORIZED,
        {message: "Incorrect password"}
      );
    }
    const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: "1h"});
    return responseHandler(
      res,
      StatusCodes.OK,
      {user: {id: user.id, username: username}, token: token, message: "Logged in successfully"}
    );
  } catch(err) {
    console.error(err);
    return responseHandler(
      res,
      StatusCodes.UNAUTHORIZED,
      {message: "Login failed"}
    );
  }
}

async function register(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return responseHandler(
      res, 
      StatusCodes.BAD_REQUEST, 
      {message: "Username or password not provided"}
    );
  }
  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const isDup = await User.findOne({
      where: {username}
    });
    if (isDup) {
      return responseHandler(
        res,
        StatusCodes.CONFLICT,
        {message: "This username is taken"}
      );
    }
    await User.create({
      username,
      passwordHash
    });
    const user = await User.findOne({
      attributes: [
        "id",
        "username"
      ],
      where: {username}
    });
    return responseHandler(
      res,
      StatusCodes.CREATED,
      {user, message: "User registered successfully"}
    );
  } catch(err) {
    console.error(err);
    return responseHandler(
      res,
      StatusCodes.NOT_IMPLEMENTED,
      {message: "Faced an error handling your request"}
    );
  }
}

async function getCurrentUser(req, res) {
  const userId = req.user.userId;
  const user = await User.findOne({
    attributes: [
      "id",
      "username",
      "createdAt",
      "updatedAt"
    ],
    where: {id: userId}
  });
  if (!user) {
    return responseHandler(
      res,
      StatusCodes.NOT_FOUND,
      {
        message: "User not found"
      }
    );
  }
  return responseHandler(
    res,
    StatusCodes.OK,
    {
      user,
      message: "User found successfully"
    }
  );
}

module.exports = {
  login,
  register,
  getCurrentUser
};
