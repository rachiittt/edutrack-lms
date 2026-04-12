import { Quiz, IQuiz } from '../models/Quiz';
import { Result, IResult } from '../models/Result';
import { IQuizRepository, IResultRepository } from '../interfaces/IQuizRepository';
import { BaseRepository } from './BaseRepository';
export class QuizRepository extends BaseRepository<IQuiz> implements IQuizRepository {
  constructor() {
    super(Quiz);
  }
  async findByCourse(courseId: string): Promise<IQuiz[]> {
    return this.model
      .find({ course: courseId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
export class ResultRepository extends BaseRepository<IResult> implements IResultRepository {
  constructor() {
    super(Result);
  }
  async findByStudentAndQuiz(studentId: string, quizId: string): Promise<IResult | null> {
    return this.model.findOne({ student: studentId, quiz: quizId }).exec();
  }
  async findByQuiz(quizId: string): Promise<IResult[]> {
    return this.model
      .find({ quiz: quizId })
      .populate('quiz', 'title questions')
      .exec() as unknown as Promise<IResult[]>;
  }
  async findByStudent(studentId: string): Promise<IResult[]> {
    return this.model
      .find({ student: studentId })
      .populate('quiz', 'title')
      .populate('course', 'title')
      .sort({ submittedAt: -1 })
      .exec();
  }
  async findByQuizWithStudentDetails(quizId: string): Promise<IResult[]> {
    return this.model
      .find({ quiz: quizId })
      .populate('student', 'name email')
      .populate('quiz', 'title')
      .sort({ score: -1 })
      .exec();
  }
}
