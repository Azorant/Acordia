import { ConsoleTransport, Logger, LoggerLevel, PlainFileTransport } from '../dist/index.js';

const logger = Logger.createInstance('test')
  .addTransport(new ConsoleTransport({ minimumLevel: LoggerLevel.Debug }))
  .addTransport(new PlainFileTransport({ minimumLevel: LoggerLevel.Debug, fileRetention: 1 }));

logger.debug('Some debug message with an object', { userId: '...' });
logger.notice('Some notice message');
logger.info('Some info message', 'with', 4, 'arguments');
logger.success('Some success message');
logger.warning('Some warning message');
logger.error('Some error message');

function someFunction() {
  // Change the log format for only the console transport
  logger.transports[0]!.logFormat =
    '{time} | {level} | {name} | {fileName} | {functionName} | {lineNumber} | {columnNumber} | {content}';
  logger.info('So much information');
}

someFunction();
