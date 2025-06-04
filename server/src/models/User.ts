import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequelize';

class User extends Model {
  public id!: number;
  public firebaseUid!: string;
  public email!: string;
  public name!: string | null;
  public role!: string;
  public picture!: string | null;
  public lastLogin!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firebaseUid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'firebase_uid',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

export default User; 