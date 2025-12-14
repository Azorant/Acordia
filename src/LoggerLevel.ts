import chalk from 'chalk';

export enum LoggerLevel {
  Debug,
  Notice,
  Info,
  Success,
  Warning,
  Error,
}

export const LevelTagLabel = {
  [LoggerLevel.Debug]: ' debug ',
  [LoggerLevel.Notice]: 'notice ',
  [LoggerLevel.Info]: ' info  ',
  [LoggerLevel.Success]: 'success',
  [LoggerLevel.Warning]: 'warning',
  [LoggerLevel.Error]: ' error ',
};

export const LevelTagColour = {
  [LoggerLevel.Debug]: chalk.gray,
  [LoggerLevel.Notice]: chalk.bgRedBright,
  [LoggerLevel.Info]: chalk.blue,
  [LoggerLevel.Success]: chalk.greenBright,
  [LoggerLevel.Warning]: chalk.yellowBright,
  [LoggerLevel.Error]: chalk.redBright,
};
