'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here if any
    }
  }
  
  User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    
    
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user' // Default user biasa
    },
    apiKey: {
      type: DataTypes.STRING,
      unique: true
    }

  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};