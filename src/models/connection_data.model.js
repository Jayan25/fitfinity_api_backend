// 'use strict';

// module.exports = (sequelize, DataTypes) => {
//   const ConnectionData = sequelize.define("ConnectionData", {
//     id: {
//       type: DataTypes.BIGINT,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     user_id: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     trainer_id: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//    status:{
//     type:DataTypes.BIGINT,
//     default:0, //0: sent, 1: accepted, 2: rejected
//    },
   
//   }, {
//     timestamps: true,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//     tableName: "enquiry",
//   });

//   ConnectionData.associate = (models) => {
//     ConnectionData.belongsTo(models.Users, {
//       foreignKey: "user_id",
//       as: "user",
//       constraints: false,
//     });
//     ConnectionData.belongsTo(models.Trainers, {
//       foreignKey: "trainer_id",
//       as: "user",
//       constraints: false,
//     });
//   };

//   return ConnectionData;
// };
