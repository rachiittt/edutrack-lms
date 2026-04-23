import app from './app';
import { config } from './config/env';
import { connectDB } from './config/db';
const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`\nEduTrack API server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Frontend URL: ${config.frontendUrl}`);
      console.log(`Health check: http://localhost:${config.port}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});
startServer();
