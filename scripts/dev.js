const { spawn } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

function runService(name, dir, colorCode) {
  const reset = '\x1b[0m';
  const color = `\x1b[${colorCode}m`;

  const child = spawn(npmCmd, ['run', 'dev'], {
    cwd: path.join(__dirname, '..', dir),
    shell: true,
    env: process.env,
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line) console.log(`${color}[${name}]${reset} ${line}`);
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line) console.error(`${color}[${name}]${reset} ${line}`);
    });
  });

  child.on('close', (code) => {
    console.log(`${color}[${name}]${reset} Exited with code ${code}`);
  });

  return child;
}

console.log('🍌 Starting Banana Math Game (Backend + Frontend)...\n');
const backend = runService('Backend', 'backend', '33');  // yellow
const frontend = runService('Frontend', 'frontend', '36'); // cyan

process.on('SIGINT', () => {
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
});
