import { Sequelize } from 'sequelize';
import { logger } from './logger';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'docvault_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,      // snake_case columns
    timestamps: true,
    freezeTableName: false,
  },
});

export async function connectDatabase(): Promise<void> {
  await sequelize.authenticate();
  // In dev, sync without force. Run migrations in production.
  if (process.env.NODE_ENV === 'development') {
    await sequelize.sync({ alter: false });
  }
}

export default sequelize;
