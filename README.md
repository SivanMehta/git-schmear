##  `git-schmear`

Spread the existing commits over a timeframe. Use this to pretend like you've
been working this whole time, rather than cramming in everything at the last
minute.

## Running yourself

```sh
cd /repo/you/want/to/spoof/
cp /path/to/this/repo/forge.js .
node forge.js
```

If you want to spoof a fresh repo, copy over `spoof.sh` to get yourself some
freshly minted commits. You can see [this](schmeared)
repo for an example of a repo that has been `git-schmeared`.

## Testing ![](https://travis-ci.com/SivanMehta/git-schmear.svg?branch=master)

```
npm test
```

## TODO

- Variable intervals of schmear, as opposed to 1 day intervals.
- Preserving `git` authorship, which is currently blown away.
- Take start time as a CLI parameter and distribute commits from then until now.

[schmeared]: https://github.com/SivanMehta/git-schmeared
