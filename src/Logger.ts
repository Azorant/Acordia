import path from 'path';
import { inspect } from 'util';
import { DateTime } from 'luxon';
import StackTrace from 'stacktrace-js';
import { LevelTagColour, LevelTagLabel, LoggerLevel } from './LoggerLevel.js';
import type { BaseTransport } from './transports/BaseTransport.js';

export class Logger {
  /**
   * Name of logger
   *
   * @type {string}
   * @memberof Logger
   */
  name: string;

  transports: Array<BaseTransport> = [];

  constructor(name: string) {
    this.name = name;
  }

  public static createInstance(name: string) {
    return new Logger(name);
  }

  setMinimumLevel(level: LoggerLevel) {
    for (const transport of this.transports) transport.minimumLevel = level;
    return this;
  }

  addTransport(transport: BaseTransport) {
    this.transports.push(transport);
    return this;
  }

  /**
   * Log a debug message
   *
   * @param {...unknown[]} args
   * @memberof Logger
   */
  public debug(...args: unknown[]) {
    this.log(LoggerLevel.Debug, ...args);
  }

  /**
   * Log a info message
   *
   * @param {...unknown[]} args
   * @memberof Logger
   */
  public info(...args: unknown[]) {
    this.log(LoggerLevel.Info, ...args);
  }

  /**
   * Log a success message
   *
   * @param {...unknown[]} args
   * @memberof Logger
   */
  public success(...args: unknown[]) {
    this.log(LoggerLevel.Success, ...args);
  }

  /**
   * Log a warning warning
   *
   * @param {...unknown[]} args
   * @memberof Logger
   */
  public warning(...args: unknown[]) {
    this.log(LoggerLevel.Warning, ...args);
  }

  /**
   * Log a error message
   *
   * @param {...unknown[]} args
   * @memberof Logger
   */
  public error(...args: unknown[]) {
    this.log(LoggerLevel.Error, ...args);
  }

  /**
   * Log a notice message
   *
   * @param {...unknown[]} args
   * @memberof Logger
   */
  public notice(...args: unknown[]) {
    this.log(LoggerLevel.Notice, ...args);
  }

  private log(level: LoggerLevel, ...args: unknown[]) {
    const parsed = [];
    for (const arg of args) {
      if (typeof arg === 'object') {
        parsed.push(inspect(arg));
      } else parsed.push(arg);
    }

    const line = parsed.join(' ');
    const trace = StackTrace.getSync()[2];
    const date = DateTime.now();

    for (const transport of this.transports) {
      if (level < transport.minimumLevel) continue;

      let message = transport.logFormat
        .replace('{time}', transport.time(date))
        .replace('{content}', line)
        .replace('{name}', this.name);

      if (trace) {
        message = message
          .replace('{fileName}', path.basename(trace.getFileName()))
          .replace('{lineNumber}', trace.getLineNumber().toString())
          .replace('{functionName}', trace.getFunctionName())
          .replace('{columnNumber}', trace.getColumnNumber().toString());
      }

      void transport.log({
        name: this.name,
        level: level,
        time: date,
        raw: message.replace('{level}', LevelTagLabel[level]),
        formatted: message.replace('{level}', LevelTagColour[level](LevelTagLabel[level])),
      });
    }
  }
}
