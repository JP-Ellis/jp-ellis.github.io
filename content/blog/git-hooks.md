date: 2015-12-08
title: Git Hooks
status: published
tags: git

Git is a powerful version control system which has become the *de facto*
standard in recent years (judging by the popularity
of [Github](https://www.github.com/)).  Perhaps one of Git's underused features
is its [hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks): small
scripts that are run whenever a specific action is run.  For example, one could
set up a *pre-push* hook that runs the test suite so that breaking changes
aren't inadvertently introduced.  Another common use for hooks is to deploy
changes.  For example, one could have a server hosting a
basic [Jekyll](https://jekyllrb.com/) or [Pelican](http://getpelican.com/) blog
and using the *post-update* hook one could get the server to automatically
regenerate the website whenever changes are pushed onto the server.  Since Git
hooks allow *any* script to be executed, hooks can be used to automate nearly
any task.

<!-- PELICAN_END_SUMMARY -->

This website is generated using Pelican and is hosted
with [Github Pages](https://pages.github.com/).  Github Pages allows you to host
your website for free with Github, and all you need to do is create a repository
called `USERNAME.github.io` and then Github will automatically start serving the
HTML files from the `master` branch of that repository[^fn:jekyll].  Github
Pages also allows you to have per-projects websites.  In this case, you need to
create a branch called `gh-pages` in any of your current repositories and Github
will then serve the content of that branch over at
`USERNAME.github.io/REPOSITORY`.

I first go through how my Github Pages is organized and then how I use Git hooks


Github Pages Setup
==================

I have set up my `jp-ellis.github.io` with three branches:

- `source` contains the original files Pelican uses in order to generate the
  website;
- `master` contains the output generated by Pelican.  Nearly all commits
  should be automatically generated;
- `theme` contains the theme-specific files.  This could be included within
  the `source` branch, but I have kept it separate in case I want to load
  another theme, or if I wish to move the theme to its own repository.

Since the `source` branch requires the `theme` branch, it is a good idea to add
the `theme` branch as
a [submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) of `source`.
This means that if you clone the `source` branch into a new directory, you can
also have Git clone submodules at once.  I have done the same with the `master`
branch so that in the end, my repository has the following structure:

```text
jp-ellis.github.io/   <-- source branch
├── content/
├── output/           <-- master branch (submodule)
├── themes/
│   └── jp-ellis/     <-- theme branch (submodule)
└── ...
```

With everything setup this way, the general procedure to update the website is:

1. Make the changes to the `source` branch, commit them;
2. Push the `source` branch.
3. Run `make publish` in order to generate the content with Pelican;
4. Stage and commit all the changes in `./output/` and push them;

Although four steps isn't all that much, steps 3 and 4 are tedious and always
the same and lend themselves very well to being automated by using the Git
`pre-push` hook.


Git Pre-push Hook
=================

In order to automate steps 3 and 4 in the above list, I will use the
`pre-push` hook.  As the name suggests, this hook is executed before every
push and if the script exits with a non-zero code, the push is aborted.  This
could be used to make sure that breaking changes aren't pushed, or in my case,
to make sure that generated content always follows closely the source files used
to generate the content.

The hooks are simple executable scripts located in `.git/hooks/`.  By default,
new repositories have a few sample scripts which end in `.sample` which can be
put to use by removing the extension.  The script needs to have the executable
flag set (with `chmod +x <hook>` and can be in any scripting language you
want, whether that be Python, bash, or whatever you prefer.

My `pre-push` hook consists of the following file:

```
#!/bin/zsh

commit_hash=$(git rev-parse --short HEAD)
make publish || return 1
cd output
export GIT_WORK_TREE=$(pwd)
git diff --exit-code &>/dev/null
if [[ $? -eq 1 ]]; then
    rm -rf pages
    git add --all
    git commit -m "Update to ${commit_hash}."
    git push
else
    echo "No changes to the 'output'."
fi
```

The script begins in the root of the `source` branch where it gets the short
hash of the latest commit (line 3).  It then uses `make publish` in order to
generate the content with Pelican and if, for any reason, that fails the hook
exits with a non-zero value causing the push to be aborted.

Once the content is generated, we switch branches (line 5) and update
`GIT_WORK_TREE`.  This is an environment variable that overrides where Git looks
for file.  Typically, it is not set and the repository is inferred based on the
current working directory but in the case of a hook, `GIT_WORK_TREE` is set and
changing directories to another repository doesn't actually cause Git to change
directories.

Next, we check if there are any changes to be content with `git diff
--exit-code`.  This exist with status `1` if there are changes, and status `0`
if there are none.  Line 8 then checks for this exit code and if there is no
change it simply says that there is nothing to be done.  On the other hand, if
there are changes it stages everything (line 10), commits it with a reference to
the corresponding commit in `source` (line 11) and pushes the changes (line 12).

The only line I have no addressed is line 9: `rm -rf pages`.  The `pages`
directory is created by Pelican because it contains submodules, and these
submodules have a special `.git` symlink which Pelican treats as a file.  As a
result, Pelican copies the hierarchy up to the `.git` symlink which ultimately
causes Github to get confused because when it receives the pages, it tries to
load the submodule and fails.

Thanks to the `pre-push` script, running `git push` from the parent directory
takes care of pushing all the changes to the website automatically.


[^fn:jekyll]: Github also supports Jekyll sites.  In this case, you can just
    upload the Jekyll source files and Github will automatically generate the output
    and serve that.  Unfortunately, you can't customize which Gems Github uses, so
    this option is not as flexible.