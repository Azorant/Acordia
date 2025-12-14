import { DateTime } from 'luxon';
import { LoggerLevel } from '../LoggerLevel.js';
import { BaseTransport, type LogDetails } from './BaseTransport.js';

export class ConsoleTransport extends BaseTransport {
  async log(details: LogDetails) {
    switch (details.level) {
      case LoggerLevel.Error:
        console.error(details.formatted);
        return;
      case LoggerLevel.Warning:
        console.warn(details.formatted);
        return;
      default:
        console.log(details.formatted);
    }
  }

  time(date: DateTime) {
    return date.toFormat(this.timeFormat);
  }
}
