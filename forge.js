const { exec } = require('child_process');

const ONE_DAY = 1000 * 60 * 60 * 24;
const today = new Date();
// 100 days ago will be our starting point
const days = 100;
const start = new Date(+today - ONE_DAY * days);

function rebuildStack(size = 1) {
  exec('git stash pop', () => {
    const day = new Date(+start + ONE_DAY * size).toUTCString();
    const commit = `GIT_COMMITTER_DATE="${day}" git commit -m "add data/${size}.txt" --no-edit --date "${day}"`
    exec(commit, () => {
      exec('git stash list | wc -l', (err, stdout) => {
        const completed = days - parseInt(stdout.match(/[0-9]+/)[0]);
        if(completed < days) {
          rebuildStack(completed + 1);
        }
      });
    });
  });
}


/**
 * For each given sha, reset all the way back to the beginning, storing everything
 * in git's stash stack
 * @param {Number} idx - which text file we're reverting 
 */
function buildStack(idx) {
  exec('git reset --soft HEAD~', () => {
    exec('git stash', () => {
      if(idx > 1) {
        buildStack(idx - 1);
      } else {
        rebuildStack();
      }        
    });
  });
}

function run() {
  // gather list of commmits
  exec('git log | grep commit', (error, stdout, stderr) => {
    const shas = stdout
      .split('\n')
      .map(line => line.replace(/commit /, ''))
      .filter(line => line.length > 0);
  
    // send to be reset
    buildStack(shas.length)
  });
}

run();
