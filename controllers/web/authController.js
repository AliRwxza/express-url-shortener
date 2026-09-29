const { StatusCodes } = require('http-status-codes');
const {User} = require('../../models');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

function showRegister(req, res) {
  res.render("auth/register", {
    title: "Register"
  });
}

function showLogin(req, res) {
  res.render("auth/login", {
    title: "Login"
  });
}

async function login(req, res) {
  try {    
    const {username, password} = req.body;
    const user = await User.findOne({
      where: {username}
    });
  
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).render("auth/login", {
        title: "Login",
        error: "Invalid username or password"
      });
    }
  
    const passwordCheck = await bcrypt.compare(password, user.passwordHash);
    if (!passwordCheck) {
      return res.status(StatusCodes.UNAUTHORIZED).render("auth/login", {
        title: "Login",
        error: "Invalid username or password.",
      });
    }

    req.session.user = {
      id: user.id,
      username: user.username
    };
  
    res.redirect("/links/mylinks");
  } catch(err) {
    return res.status(StatusCodes.UNAUTHORIZED).render("auth/login", {
        title: "Login",
        error: "Login failed.",
      })
  }
}

async function register(req, res) {
  const {username, password} = req.body;

  if (!username || !password) {
    return res.status(StatusCodes.BAD_REQUEST).render("auth/register", {
      title: "Register",
      error: "Username and password cannot be empty"
    });
  }
  try {
    const isDup = await User.findOne({
      where: {username}
    });

    if (isDup) {
      return res.status(StatusCodes.CONFLICT).render("auth/register", {
        title: "Register",
        error: "This username is taken"
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      username,
      passwordHash
    });
    if (!user) {
      return res.status(StatusCodes.NOT_IMPLEMENTED).render("auth/register", {
        title: "Register",
        error: "Internal error. Please try again"
      })
    }

    res.redirect("login");
  } catch(err) {
    console.error(err);

    return res.status(503).render("auth/register", {
      title: "Register",
      error: "Not yet implemented"
    });
  }
}

async function logout(req, res) {
  try {
    req.session.destroy();
    res.clearCookie("connect.sid");

    return res.redirect("/auth/login");
  } catch(err) {
    return res.render("error", {
      err: {
        status: 500,
        message: err
      }
    });
  }
}

module.exports = {
  showRegister,
  register,
  showLogin,
  login,
  logout
}