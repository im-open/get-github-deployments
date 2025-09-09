# get-github-deployments

This action gets a list of GitHub deployments and statuses created by [im-open/create-github-deployment]. It is designed to work with a custom Spotify Backstage GitHub Deployments plugin called [im-open/im-github-deployments].

## Index <!-- omit in toc -->

- [Inputs](#inputs)
- [Outputs](#outputs)
- [Usage Example](#usage-example)
  - [Return Example](#return-example)
- [Contributing](#contributing)
  - [Incrementing the Version](#incrementing-the-version)
  - [Source Code Changes](#source-code-changes)
  - [Recompiling Manually](#recompiling-manually)
  - [Updating the README.md](#updating-the-readmemd)
- [Code of Conduct](#code-of-conduct)
- [License](#license)


## Inputs

| Parameter     | Is Required | Description                                                                                                                                                                                                                       |
| ------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `token`       | true        | A token with `deployments:read` and `contents:read` to get the deployments and release reference data.                                                                                                                            |
| `environment` | true        | The name of a GitHub environment the release was deployed to, i.e. [Dev\|QA\|Stage\|Demo\|UAT\|Prod]. It will be used to filter deployment objects.                                                                               |
| `entity`      | true        | The entity that is deployed, i.e. "proj-app", "proj-infrastruction" or "proj-db".                                                                                                                                                 |
| `instance`    | true        | A freeform identifier to distinguish separately deployed instances of the entity in the same environment. Typical uses would be to name a slot and/or region, e.g "NA26", "NA26-slot1", "NA27-blue", "Primary", "Secondary", etc. |

**`environment`, `entity`, and `instance` values will be searched in a case-insensitive manner.**

## Outputs

| Value       | Description                                           |
| ----------- | ----------------------------------------------------- |
| deployments | A list of deployments by `environment` and `instance` |

## Usage Example

```yaml
name: Get Environment Instance Deployments
on:
  workflow_dispatch:
    environment:
      description: The testing environment
      required: true
      type: choice
      options:
        - Dev
        - QA
    inputs:
      instance:
        description: The instance to deploy to
        required: true
        type: choice
        options:
          - Primary-Test-Slot1
          - Primary-Test-Slot2
          - Secondary-Test-Slot1
          - Secondary-Test-Slot2

# Permissions needed to get GitHub deployments &  status objects
permissions:
  deployments: read
  contents: read

jobs:
  environment: ${{ github.event.inputs.environment }}
  deploy-different-ways:
    runs-on: [ubuntu-20.04]

    steps:
      get-deployments:
        runs-on: ubuntu-latest
        steps:
          - name: Get Deployments
            id: get-deployments
            uses: im-open/get-github-deployments@v1.0.3
            with:
              token: ${{ secrets.GITHUB_TOKEN }}
              environment: ${{ github.event.inputs.environment }}
              entity: get-github-deployments
              instance: ${{ github.event.inputs.instance }}

          - name: Display Deployments
            id: display-deployments
            run: echo "${{ steps.get-deployments.outputs.deployments }}"
      ...
```

*_Make sure your workflow has the `permissions.contents` and `permissions.deployments` set to `read`._*

### Return Example

```json
[
    {
        "ref": "v1.2.1",
        "status": "SUCCESS",
        "description": "It worked!",
        "workflow_actor": "gh-user",
        "created_at": "2024-01-31T17:21:08.000+00:00"
    },
    {
        "ref": "v1.2.3",
        "status": "INACTIVE",
        "description": "Inactivated by workflow",
        "workflow_actor": "gh-user",
        "created_at": "2024-01-31T17:21:08.000+00:00"
    },
    {
        "ref": "v1.2.2",
        "status": "INACTIVE",
        "description": "Inactivated by workflow",
        "workflow_actor": "gh-user",
        "created_at": "2024-01-30T23:26:19.000+00:00"
    },
    ...
]
```

## Contributing

When creating PRs, please review the following guidelines:

- [ ] The action code does not contain sensitive information.
- [ ] At least one of the commit messages contains the appropriate `+semver:` keywords listed under [Incrementing the Version] for major and minor increments.
- [ ] The action has been recompiled.  See [Recompiling Manually] for details.
- [ ] The README.md has been updated with the latest version of the action.  See [Updating the README.md] for details.

### Incrementing the Version

This repo uses [git-version-lite] in its workflows to examine commit messages to determine whether to perform a major, minor or patch increment on merge if [source code] changes have been made.  The following table provides the fragment that should be included in a commit message to active different increment strategies.

| Increment Type | Commit Message Fragment                     |
| -------------- | ------------------------------------------- |
| major          | +semver:breaking                            |
| major          | +semver:major                               |
| minor          | +semver:feature                             |
| minor          | +semver:minor                               |
| patch          | *default increment type, no comment needed* |

### Source Code Changes

The files and directories that are considered source code are listed in the `files-with-code` and `dirs-with-code` arguments in both the [build-and-review-pr] and [increment-version-on-merge] workflows.

If a PR contains source code changes, the README.md should be updated with the latest action version and the action should be recompiled.  The [build-and-review-pr] workflow will ensure these steps are performed when they are required.  The workflow will provide instructions for completing these steps if the PR Author does not initially complete them.

If a PR consists solely of non-source code changes like changes to the `README.md` or workflows under `./.github/workflows`, version updates and recompiles do not need to be performed.

### Recompiling Manually

This command utilizes [esbuild] to bundle the action and its dependencies into a single file located in the `dist` folder.  If changes are made to the action's [source code], the action must be recompiled by running the following command:

```sh
# Installs dependencies and bundles the code
npm run build
```

### Updating the README.md

If changes are made to the action's [source code], the [usage examples] section of this file should be updated with the next version of the action.  Each instance of this action should be updated.  This helps users know what the latest tag is without having to navigate to the Tags page of the repository.  See [Incrementing the Version] for details on how to determine what the next version will be or consult the first workflow run for the PR which will also calculate the next version.

## Code of Conduct

This project has adopted the [im-open's Code of Conduct](https://github.com/im-open/.github/blob/main/CODE_OF_CONDUCT.md).

## License

Copyright &copy; 2024, Extend Health, LLC. Code released under the [MIT license](LICENSE).

<!-- Links -->
[im-open/create-github-deployment]: https://github.com/im-open/create-github-deployment
[im-open/im-github-deployments]: https://github.com/im-open/im-github-deployments
[Backstage Software Catalog]: https://backstage.io/docs/features/software-catalog/
[Incrementing the Version]: #incrementing-the-version
[Recompiling Manually]: #recompiling-manually
[Updating the README.md]: #updating-the-readmemd
[source code]: #source-code-changes
[usage examples]: #usage-examples
[build-and-review-pr]: ./.github/workflows/build-and-review-pr.yml
[increment-version-on-merge]: ./.github/workflows/increment-version-on-merge.yml
[esbuild]: https://esbuild.github.io/getting-started/#bundling-for-node
[git-version-lite]: https://github.com/im-open/git-version-lite
[the board]: https://github.com/im-open/inactivate-github-deployment/projects/1
[cleanup-deployment-board]: https://github.com/im-open/cleanup-deployment-board

[im-github-deployments]: https://github.com/im-open/im-github-deployments
