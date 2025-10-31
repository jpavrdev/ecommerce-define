import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index.js';

interface EmailVerificationTokenAttributes {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type EmailVerificationTokenCreation = Optional<
  EmailVerificationTokenAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'usedAt'
>;

export class EmailVerificationToken
  extends Model<EmailVerificationTokenAttributes, EmailVerificationTokenCreation>
  implements EmailVerificationTokenAttributes
{
  public id!: number;
  public userId!: number;
  public tokenHash!: string;
  public expiresAt!: Date;
  public usedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EmailVerificationToken.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    tokenHash: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'email_verification_tokens',
    indexes: [
      { fields: ['userId'] },
      { unique: true, fields: ['tokenHash'] },
      { fields: ['expiresAt'] },
    ],
  }
);

