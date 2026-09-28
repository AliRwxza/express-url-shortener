const createHttpError = require("http-errors");
const {User} = require("../../models");

async function profile(req, res, next) {
  const userId = req.session.user.id;
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
    return next(createHttpError(404));
  }

  return res.render("profile", {
    user
  });
}

module.exports = {
  profile
}