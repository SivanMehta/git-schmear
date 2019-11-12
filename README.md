##  `git-schmear`

Spread the existing commits over a timeframe.

## Running yourself

```
cd /repo/you/want/to/spoof/
cp /path/to/this/repo/forge.js .
node forge.js
```

If you want to spoof a fresh repo, try running `spoof.sh` to get yourself some
freshly minted commits. You can see [this](https://github.com/SivanMehta/git-schmeared)
repo for an example of a repo that has been `git-schmeared`.

## Features

- Preserves commit messages

## TODO

- Working on something other than `master`
- preserving `git` authorship, which is currently blown away
- evenly distributing commits over a given time frame.
- take start as a CLI flag and evenly distribute commits from then till now
