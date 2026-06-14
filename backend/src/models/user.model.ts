import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';

export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance method — compare plain password with hash
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Strip password from JSON output
  public toJSON(): Omit<UserAttributes, 'password'> {
    const values = super.toJSON() as UserAttributes;
    const { password: _pw, ...safeValues } = values;
    return safeValues;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true, len: [2, 100] },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'MANAGER', 'EMPLOYEE'),
      allowNull: false,
      defaultValue: 'EMPLOYEE',
    },
  },
  {
    sequelize,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 12);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
    indexes: [
      { unique: true, fields: ['email'] },
      { fields: ['role'] },
    ],
  },
);

export default User;
