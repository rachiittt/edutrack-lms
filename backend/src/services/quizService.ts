import { IQuiz } from '../models/Quiz';
import { IResult } from '../models/Result';
import { IQuizRepository, IResultRepository } from '../interfaces/IQuizRepository';
import { ICourseRepository } from '../interfaces/ICourseRepository';
import { IEnrollmentRepository } from '../interfaces/IEnrollmentRepository';
import { IQuizService, IQuizEvaluationStrategy } from '../interfaces/IQuizService';
import { EvaluationStrategyFactory } from '../patterns/QuizEvaluationStrategy';
import { eventBus, AppEvents } from '../patterns/EventBus';
import { ApiError } from '../utils/ApiError';
import { Logger } from '../utils/Logger';
export class QuizService implements IQuizService {
  private readonly quizRepository: IQuizRepository;
  private readonly resultRepository: IResultRepository;
  private readonly courseRepository: ICourseRepository;
  private readonly enrollmentRepository: IEnrollmentRepository;
  private readonly evaluationStrategy: IQuizEvaluationStrategy;
  private readonly logger: Logger;
  constructor(
    quizRepository: IQuizRepository,
    resultRepository: IResultRepository,
    courseRepository: ICourseRepository,
    enrollmentRepository: IEnrollmentRepository,
    evaluationStrategy?: IQuizEvaluationStrategy
  ) {
    this.quizRepository = quizRepository;
    this.resultRepository = resultRepository;
    this.courseRepository = courseRepository;
    this.enrollmentRepository = enrollmentRepository;
    this.evaluationStrategy = evaluationStrategy || EvaluationStrategyFactory.getStrategy('standard');
    this.logger = Logger.createLogger('QuizService');
  }
  async create(
    courseId: string,
    teacherId: string,
    userRole: string,
    data: Partial<IQuiz>
  ): Promise<IQuiz> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }
    if (
      userRole !== 'admin' &&
      course.teacher._id?.toString() !== teacherId &&
      course.teacher.toString() !== teacherId
    ) {
      throw ApiError.forbidden('You can only create quizzes for your own courses');
    }
    const quiz = await this.quizRepository.create({
      ...data,
      course: courseId,
    } as any);
    this.logger.info(`Quiz created: ${data.title} for course ${courseId}`);
    await eventBus.publish(AppEvents.QUIZ_CREATED, {
      quizId: quiz._id,
      courseId,
      title: data.title,
    });
    return quiz;
  }
  async getByCourse(courseId: string): Promise<IQuiz[]> {
    return this.quizRepository.findByCourse(courseId);
  }
  async getById(quizId: string): Promise<IQuiz> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }
    return quiz;
  }
  async attempt(
    quizId: string,
    studentId: string,
    answers: number[]
  ): Promise<IResult> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw ApiError.notFound('Quiz not found');
    }
    const isEnrolled = await this.enrollmentRepository.isEnrolled(
      studentId,
      quiz.course.toString()
    );
    if (!isEnrolled) {
      throw ApiError.forbidden('You must be enrolled in the course to attempt this quiz');
    }
    const existingResult = await this.resultRepository.findByStudentAndQuiz(
      studentId,
      quizId
    );
    if (existingResult) {
      throw ApiError.conflict('You have already attempted this quiz');
    }
    if (answers.length !== quiz.questions.length) {
      throw ApiError.badRequest(
        `Expected ${quiz.questions.length} answers, got ${answers.length}`
      );
    }
    const correctAnswers = quiz.questions.map((q) => q.correctAnswer);
    const evaluation = this.evaluationStrategy.evaluate(answers, correctAnswers);
    this.logger.info(
      `Quiz attempted: ${quizId} by student ${studentId}. ` +
      `Strategy: ${this.evaluationStrategy.getStrategyName()}, ` +
      `Score: ${evaluation.score}/${evaluation.totalQuestions}`
    );
    const result = await this.resultRepository.create({
      student: studentId,
      quiz: quizId,
      course: quiz.course,
      answers,
      score: evaluation.score,
      totalQuestions: evaluation.totalQuestions,
    } as any);
    await eventBus.publish(AppEvents.QUIZ_ATTEMPTED, {
      studentId,
      quizId,
      courseId: quiz.course,
      score: evaluation.score,
      totalQuestions: evaluation.totalQuestions,
      percentage: evaluation.percentage,
    });
    return result;
  }
  async getResults(quizId: string, userId: string, userRole: string): Promise<IResult[]> {
    if (userRole === 'student') {
      const result = await this.resultRepository.findByStudentAndQuiz(userId, quizId);
      return result ? [result] : [];
    }
    return this.resultRepository.findByQuizWithStudentDetails(quizId);
  }
  async getStudentResults(studentId: string): Promise<IResult[]> {
    return this.resultRepository.findByStudent(studentId);
  }
}
