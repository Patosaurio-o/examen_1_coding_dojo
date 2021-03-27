const { DataTypes } = require('sequelize');
const sql = require('../db');  

const User = sql.define('User', {     
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: {
        args: true,
        msg: "ingrese un email valido"
      } 
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      min: {
        args:6,
        msg: "ingrese una contraseña entre 6 y 16 caracteres"
      },
      max: {
        args:16,
        msg: "ingrese una contraseña entre 6 y 16 caracteres"
      }
    }
  }
});

const Score = sql.define('Score', { 
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  score: {
    type: DataTypes.STRING,
    allowNull: false
  },
  percentage: {
    type: DataTypes.STRING,
    allowNull: false
  },
});

const Quest = sql.define('Quest', {     
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  question: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [15, 255],
        msg: "la pregunta tiene que tener un minimo de 15 caracteres"
      }
    }
  },
  answer_correct:{
    type: DataTypes.STRING,
    allowNull: false
  },
  answer_fake_1:{
    type: DataTypes.STRING,
    allowNull: false  
  },
  answer_fake_2:{
    type: DataTypes.STRING,
    allowNull: false
  }
});
User.hasMany(Score);
Score.belongsTo(User);

sql.sync()
.then(() => {
  console.log('error 404 Data Base not found')
});

module.exports = {
  User,
  Score,
  Quest
};