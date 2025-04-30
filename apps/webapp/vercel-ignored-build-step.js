// @todo eslint - specific nextjs config
// @todo check this file works
import { exec } from 'child_process';

const branchesToTriggerBuild = ['develop', 'main'];
const branchName = process.env.VERCEL_GIT_COMMIT_REF;

const isStagingOrProductionBranch = branchesToTriggerBuild.some((trigger) =>
  branchName.startsWith(trigger)
);

const webappDirectoryPath = '.';
const packagesDirectoryPath = '../../packages';

// Run git diff to check if there are changes in the /webapp or /packages directories
// `error` is defined if the cmd returns 1 - indicating there are file changes
exec(
  `git diff --quiet HEAD^ HEAD ${webappDirectoryPath} ${packagesDirectoryPath}`,
  (error) => {
    const webappDirectoryHasChanges = error;

    if (isStagingOrProductionBranch && webappDirectoryHasChanges) {
      console.log('✅ - Build can proceed');
      process.exit(1);
    }
    console.info(
      `🛑 - Build skipped because ${
        !error
          ? 'the /webapp or /packages directories do not have changes'
          : "branch name is not 'develop' or 'main'"
      }`
    );
    process.exit(0);
  }
);
