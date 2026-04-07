/**
 * ============================================================
 * OBSERVER PATTERN — Event Bus
 * ============================================================
 * 
 * The Observer Pattern defines a one-to-many dependency between objects,
 * so that when one object changes state, all its dependents are notified.
 * 
 * WHY: Decouples event producers from consumers. For example:
 * - When a student enrolls → log the event, send notification, update analytics
 * - When a quiz is submitted → notify teacher, update leaderboard
 * - When a course is created → send announcement
 * 
 * SOLID:
 * - SRP: The EventBus only handles event routing, not business logic.
 * - OCP: New event handlers can be added without modifying existing code.
 * - DIP: Producers and consumers depend on the EventBus abstraction,
 *   not on each other directly.
 * 
 * DESIGN PATTERN:
 * - Singleton: Only one EventBus instance exists in the application.
 * - Observer: Publishers emit events, subscribers react to them.
 */

export type EventHandler = (data: any) => void | Promise<void>;

export interface IEventBus {
  subscribe(event: string, handler: EventHandler): void;
  unsubscribe(event: string, handler: EventHandler): void;
  publish(event: string, data: any): Promise<void>;
}

/**
 * Application Events — Type-safe event names
 */
export enum AppEvents {
  USER_REGISTERED = 'user:registered',
  USER_LOGGED_IN = 'user:logged_in',
  COURSE_CREATED = 'course:created',
  COURSE_DELETED = 'course:deleted',
  STUDENT_ENROLLED = 'student:enrolled',
  QUIZ_CREATED = 'quiz:created',
  QUIZ_ATTEMPTED = 'quiz:attempted',
  MATERIAL_ADDED = 'material:added',
}

/**
 * EventBus — Singleton Observer Implementation
 * 
 * Combines Singleton + Observer patterns.
 * Encapsulation: The handlers map is private.
 */
export class EventBus implements IEventBus {
  // Singleton instance
  private static instance: EventBus;

  // Encapsulated event handler registry
  private handlers: Map<string, Set<EventHandler>>;

  private constructor() {
    this.handlers = new Map();
  }

  /**
   * Singleton accessor — ensures only one EventBus exists
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event
   */
  subscribe(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe(event: string, handler: EventHandler): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.delete(handler);
    }
  }

  /**
   * Publish an event — all subscribers are notified asynchronously
   */
  async publish(event: string, data: any): Promise<void> {
    const eventHandlers = this.handlers.get(event);
    if (!eventHandlers) return;

    const promises = Array.from(eventHandlers).map(async (handler) => {
      try {
        await handler(data);
      } catch (error) {
        console.error(`[EventBus] Error in handler for "${event}":`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Get subscriber count for an event (useful for debugging)
   */
  getSubscriberCount(event: string): number {
    return this.handlers.get(event)?.size || 0;
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();
