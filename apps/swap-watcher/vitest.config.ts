import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true,
        execArgv: ['--env-file=.env.test']
      },
      forks: { singleFork: true, execArgv: ['--env-file=.env.test'] }
    }
  }
});
