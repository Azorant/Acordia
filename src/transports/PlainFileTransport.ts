import type { DateTime } from 'luxon';
import { BaseTransport, type BaseTransportOptions, type LogDetails } from './BaseTransport.js';
import path from 'path';
import fs from 'fs';

export interface PlainFileTransportOptions extends BaseTransportOptions {
  /**
   * Path logs will be written to
   *
   * Defaults to $CWD/logs
   *
   * @type {string}
   * @memberof PlainFileTransportOptions
   */
  logPath?: string;

  /**
   * How many days of logs to keep
   *
   * @type {number}
   * @memberof PlainFileTransportOptions
   */
  fileRetention?: number;
}

export class PlainFileTransport extends BaseTransport {
  logPath = path.join(process.cwd(), 'logs');
  fileRetention = -1;

  constructor(options?: PlainFileTransportOptions) {
    super(options);
    if (options?.logPath !== undefined) this.logPath = options.logPath;
    if (options?.fileRetention !== undefined) this.fileRetention = options.fileRetention;
  }

  async log(details: LogDetails) {
    if (!fs.existsSync(this.logPath)) fs.mkdirSync(this.logPath);
    const outputFile = `${details.name}-latest.log`;
    const outputPath = path.join(this.logPath, outputFile);

    try {
      const stat = fs.statSync(outputPath);
      if (Date.now() - stat.birthtimeMs >= 8.64e7) {
        const newName = `${details.name}-${new Date(stat.birthtimeMs).toLocaleDateString('en-CA')}.log`;
        fs.renameSync(outputPath, path.join(this.logPath, newName));
        if (this.fileRetention > -1) {
          const fileNames = fs
            .readdirSync(this.logPath)
            .filter((file) => file.match(new RegExp(`${details.name}-.+\\.log`)) && file !== outputFile);
          if (fileNames.length > this.fileRetention) {
            const sorted = fileNames
              .map((file) => ({ file, stat: fs.statSync(path.join(this.logPath, file)) }))
              .sort((a, b) => a.stat.mtimeMs - b.stat.mtimeMs);
            for (const file of sorted.splice(0, sorted.length - this.fileRetention)) {
              fs.unlinkSync(path.join(this.logPath, file.file));
            }
          }
        }
      }
      fs.appendFileSync(outputPath, `${details.raw}\n`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      fs.writeFileSync(outputPath, `${details.raw}\n`);
    }
  }

  time(date: DateTime) {
    return date.toFormat(this.timeFormat);
  }
}
