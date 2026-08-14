# Contributing

## GitHub mirror
We do most of the development on our private GitLab instance and mirror the code to [GitHub](https://github.com/foldland).
Feel free to open Issues or make a PR against this repo.
We'll make sure to get to it and pick your changes onto our main branch.

There is no CI set up for GitHub yet so make sure all code passes analysis and tests beforehand.

## Commits
All commits need to be signed and signed off to pass our tests.
To sign off your commits use `git commit --signoff`.
To setup commit signing please consult the [Github documentation](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits).
We use conventional commits to have meaningful commit messages and be able to generate changelogs.
A non-breaking feature contribution to `pose_classifier` could look like this:
```bash
git commit -m "feat(pose_classifier): Add a super cool feature."
```
You can read the full documentation at https://www.conventionalcommits.org.

## Linting
We use very strict static code analysis (also known as linting) rules.
This enables us to maintain and verify a consistent code style throughout the repository.
Please make sure your code passes analysis.

## Testing
If you found a bug and are here to fix it, please make sure to also submit a test that validates that the bug is fixed.
This way we can make sure it will not be introduced again.

## Workflow
We use a rebase workflow, meaning that we rebase PRs onto the latest main branch instead of merging the current main into the development branches.
This helps to keep the git history cleaner and easier to bisect in the case of debugging a regression.
You can read more on it [here](https://www.atlassian.com/git/tutorials/merging-vs-rebasing).
