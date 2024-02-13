const core = require('@actions/core');
const { setup } = require('./library.js');
const { listDeployments } = require('./deployments.js');

async function run(context) {
  return await listDeployments(context);
}

try {
  const setupContext = setup();
  const runPromise = new Promise((resolve, reject) => {
    resolve(run(setupContext));
  });

  runPromise.then(deployments => {
    // The token can be sent by and filtered out in the log
    // but we'll delete it just to be safe.
    delete setupContext.token;

    console.log('Get Deployments:', setupContext);

    if (deployments.length == 0) {
      console.log('No deployments found');
    } else {
      console.log('Deployments Count:', deployments.length);
      core.setOutput('deployments', JSON.stringify(deployments));
    }
  });
} catch (error) {
  //Anything that shows up here should be a re-thrown error where the detailed error was already logged.
  //We can set a generic failure message because the more detailed one should already have been logged.
  core.setFailed(`An error occurred creating a GitHub deployment: ${error}`);
  return;
}
