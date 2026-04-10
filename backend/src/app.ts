import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { eventBus, AppEvents } from './patterns/EventBus';
import { Logger } from './utils/Logger';
import routes from './routes';
const app = express();
const logger = Logger.createLogger('App');
app.use(
  cors({
    origin: config.nodeEnv === 'production' ? config.frontendUrl : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'EduTrack API is running',
    version: '2.0.0',
    architecture: 'Layered (Controller → Service → Repository)',
    patterns: ['Singleton', 'Factory', 'Strategy', 'Observer', 'Repository'],
    timestamp: new Date().toISOString(),
  });
});
app.use('/api', routes);
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    error: { code: 'ERR_NOT_FOUND' },
    meta: { timestamp: new Date().toISOString() },
  });
});
app.use(errorHandler);
eventBus.subscribe(AppEvents.USER_REGISTERED, (data) => {
  logger.info(`Welcome email would be sent to user: ${data.email}`);
});
eventBus.subscribe(AppEvents.STUDENT_ENROLLED, (data) => {
  logger.info(`Enrollment notification: Student ${data.studentId} enrolled in "${data.courseName}"`);
});
eventBus.subscribe(AppEvents.QUIZ_ATTEMPTED, (data) => {
  logger.info(
    `Quiz result: Student ${data.studentId} scored ${data.score}/${data.totalQuestions} (${data.percentage}%)`
  );
});
export default app;
