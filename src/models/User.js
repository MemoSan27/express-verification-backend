const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const User = sequelize.define('user', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.TEXT,
        defaultValue: 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg'
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

module.exports = User;