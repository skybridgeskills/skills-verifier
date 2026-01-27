# Commit Current Changes

Check the current git status: `git status`

If there are no changes to commit, inform the user and stop.

If there are changes, review them: `git diff`.

Given the context of your conversation with the user, determine if there is ambiguity in what
should be committed.

If there is ambiguity, stop and ask the user for clarification.

Once the scope of changes to commit is clear:

1. Stage the changes:
   `git add <files>` or to stage all changes: `git add .`

2. Commit the changes with a message following the [Conventional Commits](https://www.conventionalcommits.org/) format:
   `git commit -m "<type>(<scope>): <description>" -m "<body>"`

The commit message should follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

<body>
```

Where:

- <type> is the type of commit (e.g. feat, fix, chore, docs, etc.)
- <scope> is the scope of the commit (e.g. ui, backend, docs, etc.)
- <description> is a short description of the commit
