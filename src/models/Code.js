const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const Code = sequelize.define('code', {
    code: {
        type: DataTypes.TEXT,
        allowNull: false
    },
});

module.exports = Code;