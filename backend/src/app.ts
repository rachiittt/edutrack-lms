import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { eventBus, AppEvents } from './utils/EventBus';
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
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(requestLogger);
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'EduTrack API is running',
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

// Import models for notification creation
import { Notification } from './models/Notification';
import { Enrollment } from './models/Enrollment';

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

// Notify enrolled students when a new material is added
eventBus.subscribe(AppEvents.MATERIAL_ADDED, async (data) => {
  try {
    const enrollments = await Enrollment.find({ course: data.courseId }).select('student').exec();
    const notifications = enrollments.map((enrollment) => ({
      recipient: enrollment.student,
      type: 'new_material' as const,
      title: 'New Material Added',
      message: `New material "${data.materialTitle}" was added to "${data.courseName}"`,
      courseId: data.courseId,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
    logger.info(`Sent ${notifications.length} material notifications for course ${data.courseId}`);
  } catch (error) {
    logger.error(`Failed to create material notifications: ${error}`);
  }
});

// Notify enrolled students when a new quiz is created
eventBus.subscribe(AppEvents.QUIZ_CREATED, async (data) => {
  try {
    const enrollments = await Enrollment.find({ course: data.courseId }).select('student').exec();
    const notifications = enrollments.map((enrollment) => ({
      recipient: enrollment.student,
      type: 'new_quiz' as const,
      title: 'New Quiz Available',
      message: `A new quiz "${data.quizTitle}" is available in "${data.courseName}"`,
      courseId: data.courseId,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
    logger.info(`Sent ${notifications.length} quiz notifications for course ${data.courseId}`);
  } catch (error) {
    logger.error(`Failed to create quiz notifications: ${error}`);
  }
});

export default app;
