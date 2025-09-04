type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
  component?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;

  private formatMessage(level: LogLevel, message: string, data?: any, component?: string): string {
    const timestamp = new Date().toISOString();
    const componentStr = component ? `[${component}] ` : '';
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    return `${timestamp} [${level.toUpperCase()}] ${componentStr}${message}${dataStr}`;
  }

  private addLog(level: LogLevel, message: string, data?: any, component?: string): void {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
      component
    };

    this.logs.push(logEntry);

    // Keep only the last MAX_LOGS entries
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Output to browser console for development
    const formattedMessage = this.formatMessage(level, message, data, component);
    
    switch (level) {
      case 'error':
        // eslint-disable-next-line no-console
        console.error(formattedMessage);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(formattedMessage);
        break;
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(formattedMessage);
        break;
      default:
        // eslint-disable-next-line no-console
        console.log(formattedMessage);
    }
  }

  info(message: string, data?: any, component?: string): void {
    this.addLog('info', message, data, component);
  }

  warn(message: string, data?: any, component?: string): void {
    this.addLog('warn', message, data, component);
  }

  error(message: string, data?: any, component?: string): void {
    this.addLog('error', message, data, component);
  }

  debug(message: string, data?: any, component?: string): void {
    this.addLog('debug', message, data, component);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  getLogsAsString(level?: LogLevel): string {
    const logs = this.getLogs(level);
    return logs.map(log => 
      this.formatMessage(log.level, log.message, log.data, log.component)
    ).join('\n');
  }

  clearLogs(): void {
    this.logs = [];
    this.info('Logs cleared', undefined, 'Logger');
  }
}

export const logger = new Logger();
export type { LogEntry, LogLevel };
