const { Octokit } = require('@octokit/rest');
const { graphql } = require('@octokit/graphql');
const { DateTime } = require('luxon');
const WORKFLOW_DEPLOY = 'workflowdeploy';

async function listDeployments(context) {
  const octokit = new Octokit({ auth: context.token });
  const octokitGraphQl = graphql.defaults({
    headers: {
      authorization: `token ${context.token}`
    }
  });

  const params = {
    owner: context.owner,
    repo: context.repo,
    task: WORKFLOW_DEPLOY,
    environment: context.environment,
    per_page: 100
  };

  const restDeployments = (
    await octokit.paginate(octokit.rest.repos.listDeployments, params)
  ).filter(
    d =>
      d.payload.entity == context.entity &&
      d.payload.instance.toString().toLowerCase() == context.instance.toString().toLowerCase()
  );

  const deploymentNodeIds = restDeployments.map(d => d.node_id);
  const statusesQuery = `
      query($deploymentNodeIds: [ID!]!) {
        deployments: nodes(ids: $deploymentNodeIds) {
          ... on Deployment {
            id
            databaseId
            environment
            ref {
              name
            }
            # We only need the most recent status
            statuses(first:1) {
              nodes {
                description
                state
                createdAt
              }
            }
          }
        }
      }`;

  const qlDeployments = await octokitGraphQl(statusesQuery, {
    deploymentNodeIds: deploymentNodeIds
  });
  const returnData = [];

  for (let i = 0; i < qlDeployments.deployments.length; i++) {
    const qlDeployment = qlDeployments.deployments[i];
    const restDeployment = restDeployments.filter(d => d.node_id == qlDeployment.id)[0];
    const env = qlDeployment.environment;

    returnData.push({
      ref: qlDeployment.ref?.name || 'N/A',
      status: qlDeployment.statuses.nodes[0].state,
      description: qlDeployment.statuses.nodes[0].description,
      workflow_actor: restDeployment.payload.workflow_actor,
      created_at: DateTime.fromISO(qlDeployment.statuses.nodes[0].createdAt)
    });
  }

  return returnData;
}

module.exports = {
  listDeployments
};
