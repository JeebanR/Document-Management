import 'dotenv/config';
import app from './app';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`🚀 DocVault API running on port ${PORT}`);
      logger.info(`📖 Swagger docs: http://localhost:${PORT}/api-docs`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
