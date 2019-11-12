const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const ONE_DAY = 1000 * 60 * 60 * 24;
const today = new Date();

/**
 * Form a git commit message given an actual message and a date on which we're
 * pretending the commit happened.
 *
 * @param  {String} message - String of what the commit originally was
 * @param  {String} day - When the commit "happened"
 * @return {String} formatted `git commit` command
 */
function formCommit(message, day) {
  return `GIT_COMMITTER_DATE="${day}" git commit -m "${message}" --date "${day}"`;
}

class Runner {
  constructor() {
    this.messageStack = [];
  }

  /**
   * Actually run the forgery.
   * @async
   */
  async start() {
    const { stdout } = await exec('git log --oneline');

    const shas = stdout
      .split('\n')
      .map(line => line.replace(/commit /, ''))
      .filter(line => line.length > 0);

    this.days = shas.length;
    this.beginning = new Date(+today - ONE_DAY * this.days);

    await this.buildStack(shas.length);
  }

  /**
   * Form a `git commit` compatible date string that represents the given number
   * of days after we started.
   *
   * @param  {Number} after - how many days after the start
   * @returns {String} date string
   * @async
   */
  formDay(after) {
    return new Date(+this.beginning + ONE_DAY * after).toUTCString();
  }

  /**
   * For each given sha, reset all the way back to the beginning, storing
   * everything in git's stash.
   *
   * @param {Number} idx - index in the commit stack
   * @async
   */
  async buildStack(idx) {
    const { stdout } = await exec('git log --oneline -1 --pretty=%B');
    const lines = stdout.split('\n');
    const message = lines.slice(0, lines.length - 2).join('\n');

    // The first commit is a special case because we cannot `git reset`.
    if (idx == 1) {
      await exec('git update-ref -d HEAD');
      const day = this.formDay(0);
      const commit = formCommit(message, day);

      await exec(commit);
      await this.rebuildRepo(idx);
    } else {
      await exec('git reset --soft HEAD~');
      await exec('git stash');

      this.messageStack.push(message);
      await this.buildStack(idx - 1);
    }
  }

  /**
   * Using the built up git stash, rebuild every commit, but with a new dates 😈.
   *
   * @param  {Number} size - how many commits we have built so far
   * @async
   */
  async rebuildRepo(size) {
    await exec('git stash pop');

    const day = this.formDay(size);
    const message = this.messageStack.pop();
    const commit = formCommit(message, day);
    await exec(commit);

    const { stdout } = await exec('git stash list | wc -l');
    const completed = this.days - parseInt(stdout.match(/[0-9]+/)[0]);
    if(this.messageStack.length > 0) {
      await this.rebuildRepo(completed + 1);
    }
  }
}

(async function () {
  const runner = new Runner();
  await runner.start();
})();
