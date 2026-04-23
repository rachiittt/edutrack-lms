import { Quiz, IQuiz } from '../models/Quiz';
import { Result, IResult } from '../models/Result';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { eventBus, AppEvents } from '../utils/EventBus';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../utils/Logger';

export class QuizService {
  private readonly logger: Logger;

  constructor() {
    this.logger = Logger.createLogger('QuizService');
  }

  private isAuthorized(course: any, userId: string, userRole: string): boolean {
    if (userRole === 'admin') return true;
    
    const mainTeacherId = course.teacher._id?.toString() || course.teacher.toString();
    if (mainTeacherId === userId) return true;
    
    if (course.collaborators && course.collaborators.some((c: any) => (c._id?.toString() || c.toString()) === userId)) {
      return true;
    }
    
    return false;
  }

  async create(courseId: string, teacherId: string, userRole: string, data: Partial<IQuiz>): Promise<IQuiz> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }
    
    if (!this.isAuthorized(course, teacherId, userRole)) {
      throw ApiError.forbidden('You are not authorized to create quizzes for this course');
    }

    const quiz = new Quiz({
      ...data,
      course: courseId,
    });

    await quiz.save();
    this.logger.info(`Quiz created: ${data.title} for course ${courseId}`);
    
    await eventBus.publish(AppEvents.QUIZ_CREATED, {
      quizId: quiz._id,
      courseId,
      quizTitle: data.title,
      courseName: course.title,
    });

    return quiz;
  }

  async getByCourse(courseId: string): Promise<IQuiz[]> {
    return Quiz.find({ course: courseId }).exec();
  }

  async getById(quizId: string): Promise<IQuiz> {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }
    return quiz;
  }

  async attempt(quizId: string, studentId: string, answers: number[]): Promise<IResult> {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }

    const isEnrolled = await Enrollment.findOne({ student: studentId, course: quiz.course });
    if (!isEnrolled) {
      throw ApiError.forbidden('You must be enrolled in the course to attempt this quiz');
    }

    const existingResult = await Result.findOne({ student: studentId, quiz: quizId });
    if (existingResult) {
      throw ApiError.conflict('You have already attempted this quiz');
    }

    if (answers.length !== quiz.questions.length) {
      throw ApiError.badRequest(`Expected ${quiz.questions.length} answers, got ${answers.length}`);
    }

    // Evaluate quiz
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        score++;
      }
    });

    const result = new Result({
      student: studentId,
      quiz: quizId,
      course: quiz.course,
      answers,
      score,
      totalQuestions: quiz.questions.length,
    });

    await result.save();
    
    this.logger.info(`Quiz attempted: ${quizId} by student ${studentId}. Score: ${score}/${quiz.questions.length}`);
    
    await eventBus.publish(AppEvents.QUIZ_ATTEMPTED, {
      studentId,
      quizId,
      courseId: quiz.course,
      score,
      totalQuestions: quiz.questions.length,
      percentage: (score / quiz.questions.length) * 100,
    });

    return result;
  }

  async getResults(quizId: string, userId: string, userRole: string): Promise<IResult[]> {
    if (userRole === 'student') {
      const result = await Result.findOne({ student: userId, quiz: quizId });
      return result ? [result] : [];
    }
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw ApiError.notFound('Quiz not found');
    
    const course = await Course.findById(quiz.course.toString());
    if (!course || !this.isAuthorized(course, userId, userRole)) {
      throw ApiError.forbidden('You are not authorized to view results for this quiz');
    }

    return Result.find({ quiz: quizId }).populate('student', 'name email avatar').exec();
  }

  async getStudentResults(studentId: string): Promise<IResult[]> {
    return Result.find({ student: studentId })
      .populate('quiz', 'title')
      .populate('course', 'title')
      .sort({ submittedAt: -1 })
      .exec();
  }
}
