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

  const deploymentsList = (
    await octokit.paginate(octokit.rest.repos.listDeployments, params)
  ).filter(d => d.payload.entity == context.entity && d.payload.instance == context.instance);

  const deploymentNodeIds = deploymentsList.map(d => d.node_id);
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

  const deployments = await octokitGraphQl(statusesQuery, { deploymentNodeIds: deploymentNodeIds });
  const returnData = [];

  for (let i in deployments) {
    const deployment = deployments[i];
    const deploymentNode = deploymentsList.filter(d => d.node_id == deployment.id)[0];
    const env = deployment.environment;

    returnData.push({
      ref: deployment.ref.name,
      status: deployment.statuses.nodes[0].state,
      description: deployment.statuses.nodes[0].description,
      workflow_actor: deploymentNode.payload.workflow_actor,
      created_at: DateTime.fromISO(deployment.statuses.nodes[0].createdAt).toISO()
    });
  }

  return returnData;
}

module.exports = {
  listDeployments
};
