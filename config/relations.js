const User = require("../models/User");
const Link = require("../models/Link");
const ClickEvent = require("../models/ClickEvent");

User.hasMany(Link, {
  foreignKey: "userId"
});

Link.belongsTo(User, {
  foreignKey: "userId"
});
Link.hasMany(ClickEvent, {
  foreignKey: "linkId"
});

ClickEvent.belongsTo(Link, {
  foreignKey: "linkId"
});

module.exports = {
  User,
  Link,
  ClickEvent
};