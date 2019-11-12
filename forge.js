const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const ONE_DAY = 1000 * 60 * 60 * 24;
const today = new Date();

function formCommit(message, day) {
  return `GIT_COMMITTER_DATE="${day}" git commit -m "${message}" --date "${day}"`;
}

class Runner {
  constructor() {
    this.messageStack = [];
  }

  async start() {
    const { stdout } = await exec('git log --oneline');

    const shas = stdout
      .split('\n')
      .map(line => line.replace(/commit /, ''))
      .filter(line => line.length > 0);

    this.days = shas.length;
    this.beginning = new Date(+today - ONE_DAY * this.days);

    this.buildStack(shas.length);    
  }

  formDay(after) {
    return new Date(+this.beginning + ONE_DAY * after).toUTCString();
  }

  /**
   * For each given sha, reset all the way back to the beginning, storing everything
   * in git's stash stack
   * @param {Number} idx - which text file we're reverting
   */
  async buildStack(idx) {
    const { stdout } = await exec('git log --oneline -1 --pretty=%B');
    const lines = stdout.split('\n');
    const message = lines.slice(0, lines.length - 2).join('\n');

    // We have reached the first commit, which is a special case beacuse we
    // cannot git reset from here.
    if (idx == 1) {
      await exec('git update-ref -d HEAD');
      const day = this.formDay(0);
      const commit = formCommit(message, day);

      await exec(commit);
      await this.rebuildStack(idx);
    } else {
      await exec('git reset --soft HEAD~');
      await exec('git stash');

      this.messageStack.push(message);
      await this.buildStack(idx - 1);
    }
  }

  /**
   * Using the built up git stash, rebuild every commit, but with a new date
   * @param  {Number} size How many commits we have built so far
   */
  async rebuildStack(size) {
    await exec('git stash pop');

    const day = this.formDay(size);
    const message = this.messageStack.pop();
    const commit = formCommit(message, day);
    await exec(commit);

    const { stdout } = await exec('git stash list | wc -l');
    const completed = this.days - parseInt(stdout.match(/[0-9]+/)[0]);
    if(this.messageStack.length > 0) {
      await this.rebuildStack(completed + 1);
    }
  }
}

const runner = new Runner();
runner.start();
