const User = require("./User");
const Link = require("./Link");
const ClickEvent = require("./ClickEvent");

User.hasMany(Link,
  {foreignKey: "userId"}
);

Link.belongsTo(User,
  {foreignKey: "userId"}
);

Link.hasMany(ClickEvent,
  {foreignKey: "linkId"}
);

ClickEvent.belongsTo(Link,
  {foreignKey: "linkId"}
);

module.exports = {
  User,
  Link,
  ClickEvent
};