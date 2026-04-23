import { AuthService } from '../services/authService';
import { CourseService } from '../services/courseService';
import { EnrollmentService } from '../services/enrollmentService';
import { MaterialService } from '../services/materialService';
import { QuizService } from '../services/quizService';

const authService = new AuthService();
const courseService = new CourseService();
const enrollmentService = new EnrollmentService();
const materialService = new MaterialService();
const quizService = new QuizService();

export const container = {
  authService,
  courseService,
  enrollmentService,
  materialService,
  quizService,
};
