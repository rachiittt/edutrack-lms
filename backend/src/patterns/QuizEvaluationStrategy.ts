import { IQuizEvaluationStrategy } from '../interfaces/IQuizService';

/**
 * ============================================================
 * STRATEGY PATTERN — Quiz Evaluation
 * ============================================================
 * 
 * The Strategy Pattern defines a family of algorithms, encapsulates each one,
 * and makes them interchangeable. The algorithm varies independently from
 * clients that use it.
 * 
 * WHY: Different quiz types may require different scoring logic:
 * - Standard: 1 point per correct answer
 * - Weighted: Different questions have different point values
 * - Penalty: Wrong answers deduct points
 * - Partial: Partial credit for partially correct answers
 * 
 * SOLID:
 * - OCP: New scoring strategies can be added without modifying existing code.
 * - SRP: Each strategy class is only responsible for its scoring algorithm.
 * - DIP: QuizService depends on IQuizEvaluationStrategy interface, not concrete classes.
 * - LSP: All strategies implement the same interface and are interchangeable.
 */

/**
 * StandardEvaluation — 1 point per correct answer
 * Default evaluation strategy.
 */
export class StandardEvaluation implements IQuizEvaluationStrategy {
  evaluate(
    answers: number[],
    correctAnswers: number[]
  ): { score: number; totalQuestions: number; percentage: number } {
    let score = 0;

    answers.forEach((answer, index) => {
      if (answer === correctAnswers[index]) {
        score++;
      }
    });

    const totalQuestions = correctAnswers.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    return { score, totalQuestions, percentage };
  }

  getStrategyName(): string {
    return 'Standard Evaluation';
  }
}

/**
 * WeightedEvaluation — Later questions are worth more points.
 * Demonstrates OCP — new scoring without modifying QuizService.
 */
export class WeightedEvaluation implements IQuizEvaluationStrategy {
  evaluate(
    answers: number[],
    correctAnswers: number[]
  ): { score: number; totalQuestions: number; percentage: number } {
    let score = 0;
    let maxScore = 0;

    answers.forEach((answer, index) => {
      // Weight increases with question number (1, 2, 3, ...)
      const weight = index + 1;
      maxScore += weight;

      if (answer === correctAnswers[index]) {
        score += weight;
      }
    });

    const totalQuestions = correctAnswers.length;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return { score, totalQuestions, percentage };
  }

  getStrategyName(): string {
    return 'Weighted Evaluation';
  }
}

/**
 * PenaltyEvaluation — Wrong answers deduct 0.25 points.
 * Demonstrates how new strategies extend behavior without modification.
 */
export class PenaltyEvaluation implements IQuizEvaluationStrategy {
  private readonly penaltyFactor: number;

  constructor(penaltyFactor: number = 0.25) {
    this.penaltyFactor = penaltyFactor;
  }

  evaluate(
    answers: number[],
    correctAnswers: number[]
  ): { score: number; totalQuestions: number; percentage: number } {
    let rawScore = 0;

    answers.forEach((answer, index) => {
      if (answer === correctAnswers[index]) {
        rawScore += 1;
      } else if (answer !== -1) {
        // Penalty for wrong answer (not unanswered)
        rawScore -= this.penaltyFactor;
      }
    });

    const score = Math.max(0, Math.round(rawScore));
    const totalQuestions = correctAnswers.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    return { score, totalQuestions, percentage };
  }

  getStrategyName(): string {
    return `Penalty Evaluation (${this.penaltyFactor}x)`;
  }
}

/**
 * EvaluationStrategyFactory — Selects the right strategy by name.
 * Combines Factory + Strategy for maximum flexibility.
 */
export class EvaluationStrategyFactory {
  private static strategies: Map<string, IQuizEvaluationStrategy> = new Map();

  static {
    // Register default strategies
    EvaluationStrategyFactory.register('standard', new StandardEvaluation());
    EvaluationStrategyFactory.register('weighted', new WeightedEvaluation());
    EvaluationStrategyFactory.register('penalty', new PenaltyEvaluation());
  }

  static register(name: string, strategy: IQuizEvaluationStrategy): void {
    this.strategies.set(name, strategy);
  }

  static getStrategy(name: string = 'standard'): IQuizEvaluationStrategy {
    const strategy = this.strategies.get(name);
    if (!strategy) {
      return new StandardEvaluation(); // fallback
    }
    return strategy;
  }

  static getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}
