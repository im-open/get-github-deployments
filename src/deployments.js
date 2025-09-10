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
      d.payload.entity.toString().toLowerCase() == context.entity.toString().toLowerCase() &&
      d.payload.instance.toString().toLowerCase() == context.instance.toString().toLowerCase()
  );

  const returnData = [];

  // Process in chunks of 100
  for (let i = 0; i < restDeployments.length; i += 100) {
    const chunk = restDeployments.slice(i, i + 100);
    const deploymentNodeIds = chunk.map(d => d.node_id);
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
            statuses(first: 1) {
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
      deploymentNodeIds
    });

    for (const qlDeployment of qlDeployments.deployments) {
      const restDeployment = chunk.find(d => d.node_id === qlDeployment.id);
      if (!restDeployment || !qlDeployment.statuses.nodes.length) continue;

      returnData.push({
        ref: qlDeployment.ref?.name || 'N/A',
        status: qlDeployment.statuses.nodes[0].state,
        description: qlDeployment.statuses.nodes[0].description,
        workflow_actor: restDeployment.payload.workflow_actor,
        created_at: DateTime.fromISO(qlDeployment.statuses.nodes[0].createdAt)
      });
    }
  }

  return returnData;
}

module.exports = {
  listDeployments
};
