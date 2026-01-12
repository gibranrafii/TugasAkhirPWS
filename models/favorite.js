module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idMeal: {
      type: DataTypes.STRING,
      allowNull: false
    },
    strMeal: {
      type: DataTypes.STRING,
      allowNull: false
    },
    strThumb: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Mengarah ke tabel Users
        key: 'id'
      }
    }
  }, {
    tableName: 'Favorites', // Nama tabel di database
  });

  // Bagian Relasi
  Favorite.associate = (models) => {
    // Favorite milik 1 User
    Favorite.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Favorite;
};