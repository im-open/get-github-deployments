const core = require('@actions/core');
const github = require('@actions/github');

const requiredArgOptions = {
  required: true,
  trimWhitespace: true
};

const notRequiredArgOptions = {
  required: false,
  trimWhitespace: true
};

class context {
  constructor(token, environment, entity, instance, server_url, workflow_run_id, owner, repo) {
    this.token = token;
    this.environment = environment;
    this.entity = entity;
    this.instance = instance;
    this.server_url = server_url;
    this.workflow_run_id = workflow_run_id;
    this.owner = owner;
    this.repo = repo;
  }
}

function setup() {
  const token = core.getInput('token', requiredArgOptions);
  const environment = core.getInput('environment', requiredArgOptions);
  const entity = core.getInput('entity', requiredArgOptions);
  const instance = core.getInput('instance', requiredArgOptions);
  const server_url = github.context.serverUrl;
  const workflow_run_id = github.context.runId;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;

  return new context(
    token,
    environment,
    entity,
    instance,
    server_url,
    workflow_run_id,
    owner,
    repo
  );
}

module.exports = {
  setup
};
