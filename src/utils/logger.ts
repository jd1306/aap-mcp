export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: Date;
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentIndex = levels.indexOf(this.level);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  private format(entry: LogEntry): string {
    const prefix = entry.context ? `[${entry.context}]` : '';
    return `${prefix} ${entry.level}: ${entry.message}`.trim();
  }

  debug(message: string, context?: string): void {
    const entry: LogEntry = { level: LogLevel.DEBUG, message, context, timestamp: new Date() };
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.error(this.format(entry));
    }
  }

  info(message: string, context?: string): void {
    const entry: LogEntry = { level: LogLevel.INFO, message, context, timestamp: new Date() };
    if (this.shouldLog(LogLevel.INFO)) {
      console.error(this.format(entry));
    }
  }

  warn(message: string, context?: string): void {
    const entry: LogEntry = { level: LogLevel.WARN, message, context, timestamp: new Date() };
    if (this.shouldLog(LogLevel.WARN)) {
      console.error(this.format(entry));
    }
  }

  error(message: string, context?: string): void {
    const entry: LogEntry = { level: LogLevel.ERROR, message, context, timestamp: new Date() };
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.format(entry));
    }
  }
}

export const logger = new Logger();
