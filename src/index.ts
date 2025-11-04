import path from 'path';
import fs from 'fs';
import { inspect } from 'util';
import { DateTime } from 'luxon';
import chalk from 'chalk';
import StackTrace from 'stacktrace-js';

export enum LoggerLevel {
  Debug,
  Notice,
  Info,
  Success,
  Warning,
  Error,
}

export class Logger {
  /**
   * Path logs will be written to
   *
   * Defaults to $CWD/logs
   *
   * @memberof Logger
   */
  logPath = path.join(process.cwd(), 'logs');

  /**
   * Should logs be written to disk
   *
   * @memberof Logger
   */
  writeFile = true;
  level = LoggerLevel.Info;

  /**
   * Format for timestamp
   *
   * Any token supported by [luxon](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) can be used
   *
   * @memberof Logger
   */
  timeFormat = 'D TT';

  /**
   * Log format
   *
   * Current supported tokens are
   * - {time}
   * - {level}
   * - {name}
   * - {content}
   * - {fileName}
   * - {lineNumber}
   * - {functionName}
   * - {columnNumber}
   *
   * @memberof Logger
   */
  logFormat = '{time} | {level} | {name} | {content}';

  /**
   * Name of logger
   *
   * @type {string}
   * @memberof Logger
   */
  name: string;

  static Tag = {
    [LoggerLevel.Debug]: ' debug ',
    [LoggerLevel.Notice]: 'notice ',
    [LoggerLevel.Info]: ' info  ',
    [LoggerLevel.Success]: 'success',
    [LoggerLevel.Warning]: 'warning',
    [LoggerLevel.Error]: ' error ',
  };

  static TagColour = {
    [LoggerLevel.Debug]: chalk.gray,
    [LoggerLevel.Notice]: chalk.bgRedBright,
    [LoggerLevel.Info]: chalk.blue,
    [LoggerLevel.Success]: chalk.greenBright,
    [LoggerLevel.Warning]: chalk.yellowBright,
    [LoggerLevel.Error]: chalk.redBright,
  };

  constructor(name: string) {
    this.name = name;
  }

  public static createInstance(name: string) {
    return new Logger(name);
  }

  setLogPath(path: string) {
    this.logPath = path;
    return this;
  }

  setWrite(write: boolean) {
    this.writeFile = write;
    return this;
  }

  setLevel(level: LoggerLevel) {
    this.level = level;
    return this;
  }

  /**
   * Any token supported by [luxon](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) can be used
   *
   * @param {string} format
   * @memberof Logger
   */
  setTimeFormat(format: string) {
    this.timeFormat = format;
    return this;
  }

  /**
   * Current supported tokens are
   * - {time}
   * - {level}
   * - {name}
   * - {content}
   * - {fileName}
   * - {lineNumber}
   * - {functionName}
   * - {columnNumber}
   *
   * @param {string} format
   * @return {*}
   * @memberof Logger
   */
  setLogFormat(format: string) {
    this.logFormat = format;
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
    if (!this.checkLevel(level)) return;
    const parsed = [];
    for (const arg of args) {
      if (typeof arg === 'object') {
        parsed.push(inspect(arg));
      } else parsed.push(arg);
    }

    const line = parsed.join(' ');
    this.writeLine(level, line);

    let message = this.logFormat
      .replace('{time}', this.getTime())
      .replace('{level}', Logger.TagColour[level](Logger.Tag[level]))
      .replace('{content}', line);

    if (this.name) message = message.replace('{name}', this.name);

    const trace = StackTrace.getSync()[2];

    if (trace) {
      message = message
        .replace('{fileName}', path.basename(trace.getFileName()))
        .replace('{lineNumber}', trace.getLineNumber().toString())
        .replace('{functionName}', trace.getFunctionName())
        .replace('{columnNumber}', trace.getColumnNumber().toString());
    }

    switch (level) {
      case LoggerLevel.Error:
        console.error(message);
        return;
      case LoggerLevel.Warning:
        console.warn(message);
        return;
      default:
        console.log(message);
    }
  }

  private checkLevel(level: LoggerLevel) {
    return level >= this.level;
  }

  private getTime() {
    return DateTime.now().toFormat(this.timeFormat);
  }

  private writeLine(level: LoggerLevel, line: string) {
    if (!this.writeFile) return;
    if (!fs.existsSync(this.logPath)) fs.mkdirSync(this.logPath);
    const output = path.join(this.logPath, 'latest.log');
    let message = this.logFormat
      .replace('{time}', this.getTime())
      .replace('{level}', Logger.Tag[level])
      .replace('{content}', line);

    if (this.name) message = message.replace('{name}', this.name);

    const trace = StackTrace.getSync()[2];

    if (trace) {
      message = message
        .replace('{fileName}', path.basename(trace.getFileName()))
        .replace('{lineNumber}', trace.getLineNumber().toString())
        .replace('{functionName}', trace.getFunctionName())
        .replace('{columnNumber}', trace.getColumnNumber().toString());
    }
    try {
      const stat = fs.statSync(output);
      if (Date.now() - stat.birthtimeMs >= 8.64e7) {
        const newName = `output-${new Date(stat.birthtimeMs).toLocaleDateString('en-CA')}.log`;
        fs.renameSync(output, path.join(this.logPath, newName));
      }
      fs.appendFileSync(output, `${message}\n`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      fs.writeFileSync(output, `${message}\n`);
    }
  }
}
