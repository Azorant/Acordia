import { Logger, LoggerLevel } from '../dist/index.js';

const logger = Logger.createInstance('test').setLevel(LoggerLevel.Debug);

logger.debug('Some debug message with an object', { userId: '...' });
logger.notice('Some notice message');
logger.info('Some info message', 'with', 4, 'arguments');
logger.success('Some success message');
logger.warning('Some warning message');
logger.error('Some error message');

function someFunction() {
  logger.logFormat =
    '{time} | {level} | {name} | {fileName} | {functionName} | {lineNumber} | {columnNumber} | {content}';
  logger.info('So much information');
}

someFunction();
