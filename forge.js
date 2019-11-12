const { exec } = require('child_process');

const ONE_DAY = 1000 * 60 * 60 * 24;
const today = new Date();

class Runner {
  constructor() {
    this.init();
  }

  init() {
    this.days = 100;
    this.beginning = new Date(+today - ONE_DAY * this.days);
  }

  start() {
    // gather list of commmits
    exec('git log | grep commit', (error, stdout, stderr) => {
      const shas = stdout
        .split('\n')
        .map(line => line.replace(/commit /, ''))
        .filter(line => line.length > 0);
    
      // send to be reset
      this.buildStack(shas.length)
    });
  }

  /**
   * For each given sha, reset all the way back to the beginning, storing everything
   * in git's stash stack
   * @param {Number} idx - which text file we're reverting 
   */
  buildStack(idx) {
    exec('git reset --soft HEAD~', () => {
      exec('git stash', () => {
        if(idx > 1) {
          this.buildStack(idx - 1);
        } else {
          this.rebuildStack();
        }        
      });
    });
  }

  rebuildStack(size = 1) {
    // get the commit log before stashing
    // git log -1 --pretty=%B
    exec('git stash pop', () => {
      const day = new Date(+this.beginning + ONE_DAY * size).toUTCString();
      const commit = `GIT_COMMITTER_DATE="${day}" git commit -m "add data/${size}.txt" --no-edit --date "${day}"`
      exec(commit, () => {
        exec('git stash list | wc -l', (err, stdout) => {
          const completed = this.days - parseInt(stdout.match(/[0-9]+/)[0]);
          if(completed < this.days) {
            this.rebuildStack(completed + 1);
          }
        });
      });
    });
  }
}

const runner = new Runner();
runner.start();
