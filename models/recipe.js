'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Recipe extends Model {
    static associate(models) {
      // define association here
    }
  }
  Recipe.init({
    idMeal: DataTypes.STRING,
    strMeal: DataTypes.STRING,
    strThumb: DataTypes.STRING,
    strInstructions: DataTypes.TEXT,
    strCategory: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Recipe',
  });
  return Recipe;
};