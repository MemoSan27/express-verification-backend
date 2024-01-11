const Code = require("./Code");
const User = require("./User");

User.hasMany(Code);
Code.belongsTo(User);