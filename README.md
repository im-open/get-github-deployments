# get-github-deployments

This action gets a list of GitHub deployments and statuses created by [im-open/create-github-deployment]. It is designed to work with a custom Spotify Backstage GitHub Deployments plugin called [im-open/im-github-deployments].

## Index <!-- omit in toc -->

- [Inputs](#inputs)
- [Usage Example](#usage-example)
- [Contributing](#contributing)
  - [Incrementing the Version](#incrementing-the-version)
  - [Source Code Changes](#source-code-changes)
  - [Recompiling Manually](#recompiling-manually)
  - [Updating the README.md](#updating-the-readmemd)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

When the action runs it will add a deployment and deployment status record to the repo.  The GitHub Deployment will also have a special task d

## Inputs

| Parameter        | Is Required | Description                                                                                                                                                                                         |
| ---------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workflow-actor` | true        | The GitHub user who triggered the workflow                                                                                                                                                          |
| `token`          | true        | A token with `repo_deployment` permissions to create and update issues, workflows using this action should be granted `permissions` of `deployments: write`                                         |
| `environment`    | true        | The environment the release was deployed to, i.e. [Dev\|QA\|Stage\|Demo\|UAT\|Prod]                                                                                                                 |
| `entity`         | true        | The entity that is deployed, i.e. "proj-app", "proj-infrastruction" or "proj-db"                                                                                                                    |
| `instance`       | true        | A freeform identifier to distinguish separately deployed instances of the entity in the same environment. Typical uses would be to name a slot and/or region, e.g "NA26", "NA26-slot1", "NA27-blue" |

## Usage Example

```yaml
name: Take Down Testing
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

# Permissions needed to add GitHub Deployment and Deployment
# status objects
permissions:
  deployments: write

jobs:
  environment: ${{ github.event.inputs.environment }}
  deploy-different-ways:
    runs-on: [ubuntu-20.04]

    steps:
      ...
      # Environment cleanup steps
      ...

      inactivate-deployment:
        runs-on: ubuntu-latest
        steps:
          - name: Inactivate deployments
            id: inactivate-deployment
            uses: im-open/inactivate-github-deployment@v1.0.0
            with:
              workflow-actor: ${{ github.actor }}
              token: ${{ secrets.GITHUB_TOKEN }}
              environment: ${{ github.event.inputs.environment }}
              entity: inactivate-github-deployment
              instance: ${{ github.event.inputs.instance }}
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
