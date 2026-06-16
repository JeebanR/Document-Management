import { Sequelize } from 'sequelize';
import { logger } from './logger';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },

  logging: (msg) => logger.debug(msg),

  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },

  define: {
    underscored: true,
    timestamps: true,
    freezeTableName: false,
  },
});

export async function connectDatabase(): Promise<void> {
  await sequelize.authenticate();
  console.log('✅ Database connected');

  if (process.env.NODE_ENV === 'development') {
    await sequelize.sync({ alter: false });
  }
}

export default sequelize;