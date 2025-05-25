import { inspect } from 'node:util';

export const logger = {
  error: (message: string, error?: any, ...args: any[]) => {
    const errorMessage = inspect(
      { lvl: 'error', msg: message, error, args },
      { depth: null }
    );

    console.error(errorMessage);
  },
  warn: (message: string, ...args: any[]) => {
    const warnMessage = inspect(
      { lvl: 'warn', msg: message, args },
      { depth: null }
    );

    console.warn(warnMessage);
  },
  info: (message: string, ...args: any[]) => {
    const infoMessage = inspect(
      { lvl: 'info', msg: message, args },
      { depth: null }
    );

    console.info(infoMessage);
  },
  debug: (message: string, ...args: any[]) => {
    const debugMessage = inspect(
      { lvl: 'debug', msg: message, args },
      { depth: null }
    );

    console.debug(debugMessage);
  }
};
