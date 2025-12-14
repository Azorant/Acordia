import type { DateTime } from 'luxon';
import { LoggerLevel } from '../LoggerLevel.js';

export interface BaseTransportOptions {
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
   * @type {string}
   * @memberof BaseTransportOptions
   */
  logFormat?: string;

  /**
   * Format for timestamp
   *
   * Any token supported by [luxon](https://moment.github.io/luxon/#/formatting?id=table-of-tokens) can be used
   * @type {string}
   * @memberof BaseTransportOptions
   */
  timeFormat?: string;

  /**
   * Minimum level for this transport to log
   *
   * @type {LoggerLevel}
   * @memberof BaseTransportOptions
   */
  minimumLevel?: LoggerLevel;
}

export interface LogDetails {
  name: string;
  level: LoggerLevel;
  time: DateTime;
  raw: string;
  formatted: string;
}

export abstract class BaseTransport {
  logFormat = '{time} | {level} | {name} | {content}';
  timeFormat = 'D TT';
  minimumLevel = LoggerLevel.Info;

  constructor(options?: BaseTransportOptions) {
    if (options?.logFormat !== undefined) this.logFormat = options.logFormat;
    if (options?.timeFormat !== undefined) this.timeFormat = options.timeFormat;
    if (options?.minimumLevel !== undefined) this.minimumLevel = options.minimumLevel;
  }

  abstract log(details: LogDetails): Promise<unknown>;
  abstract time(date: DateTime): string;
}
