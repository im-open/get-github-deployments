const { listDeployments } = require('../src/deployments');
const { Octokit } = require('@octokit/rest');
const { graphql } = require('@octokit/graphql');
const { DateTime } = require('luxon');

jest.mock('@octokit/rest');
jest.mock('@octokit/graphql');

describe('listDeployments', () => {
  const mockContext = {
    token: 'fake-token',
    owner: 'test-owner',
    repo: 'test-repo',
    environment: 'production',
    entity: 'my-entity',
    instance: 'my-instance'
  };

  let graphqlCallCount = 0;

  beforeEach(() => {
    graphqlCallCount = 0;

    // Mock 120 deployments
    Octokit.mockImplementation(() => {
      const mockDeployments = Array.from({ length: 120 }, (_, i) => ({
        node_id: `node${i + 1}`,
        created_at: `2023-01-${String((i % 30) + 1).padStart(2, '0')}T00:00:00Z`,
        payload: {
          entity: 'my-entity',
          instance: 'my-instance',
          workflow_actor: `actor${i + 1}`
        }
      }));

      return {
        rest: {
          repos: {
            listDeployments: jest.fn()
          }
        },
        paginate: jest.fn().mockResolvedValue(mockDeployments)
      };
    });

    // Mock GraphQL responses in chunks
    // First chunk returns 100 entries
    // Second chunk returns 20 entries
    // This emulates the status of 120 deployments
    graphql.defaults = jest.fn(() => {
      return async (query, variables) => {
        const { deploymentNodeIds } = variables;

        if (!deploymentNodeIds || !Array.isArray(deploymentNodeIds)) {
          throw new Error('deploymentNodeIds is missing or not an array');
        }

        const startIndex = graphqlCallCount * 100;
        const deployments = deploymentNodeIds.map((id, i) => ({
          id,
          environment: 'production',
          ref: { name: `branch-${startIndex + i + 1}` },
          statuses: {
            nodes: [
              {
                state: 'success',
                description: `Deployment ${startIndex + i + 1} succeeded`,
                createdAt: `2023-01-${String(((startIndex + i) % 30) + 1).padStart(
                  2,
                  '0'
                )}T01:00:00Z`
              }
            ]
          }
        }));

        graphqlCallCount++;
        return Promise.resolve({ deployments });
      };
    });
  });

  it('given 120 deployments, should return all 120 statuses', async () => {
    const result = await listDeployments(mockContext);
    expect(result.length).toEqual(120);

    expect(result[99].ref).toMatch('branch-100');
    expect(result[99].status).toBe('success');
    expect(result[99].description).toMatch(/Deployment \d+ succeeded/);

    expect(result[119].ref).toMatch('branch-120');
    expect(result[119].status).toBe('success');
    expect(result[119].description).toMatch(/Deployment \d+ succeeded/);
  });
});
