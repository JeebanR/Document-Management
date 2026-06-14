import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';

export interface DocumentAttributes {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Document extends Model<DocumentAttributes, DocumentCreationAttributes>
  implements DocumentAttributes {
  public id!: string;
  public title!: string;
  public fileUrl!: string;
  public fileName!: string;
  public fileSize!: number;
  public mimeType!: string;
  public uploadedBy!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 255] },
    },
    fileUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'documents',
    indexes: [
      { fields: ['uploaded_by'] },
      { fields: ['title'] },
      { fields: ['created_at'] },
    ],
  },
);

// Associations
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
User.hasMany(Document, { foreignKey: 'uploadedBy', as: 'documents' });

export default Document;
