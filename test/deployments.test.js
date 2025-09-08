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

  beforeEach(() => {
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

    graphql.defaults = jest.fn(() =>
      jest.fn().mockResolvedValue({
        deployments: Array.from({ length: 100 }, (_, i) => ({
          id: `node${i + 1}`,
          environment: 'production',
          ref: { name: `branch-${i + 1}` },
          statuses: {
            nodes: [
              {
                state: 'success',
                description: `Deployment ${i + 1} succeeded`,
                createdAt: `2023-01-${String((i % 30) + 1).padStart(2, '0')}T01:00:00Z`
              }
            ]
          }
        }))
      })
    );
  });

  it('given 120 deployments, should return only the latest 100', async () => {
    const result = await listDeployments(mockContext);
    expect(result.length).toEqual(100);
  });
});
