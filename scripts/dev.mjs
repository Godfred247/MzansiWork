import { spawn } from 'node:child_process';

const processes = [
  spawn('npx', ['vite'], { stdio: 'inherit', shell: true }),
  spawn('dotnet', ['run', '--project', 'server/MzansiWork.Api', '--launch-profile', 'http'], { stdio: 'inherit', shell: true })
];

let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of processes) {
    if (child.pid) spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { shell: true, stdio: 'ignore' });
  }
  setTimeout(() => process.exit(code), 400);
}

for (const child of processes) {
  child.on('exit', (code) => {
    if (!stopping && code && code !== 0) stop(code);
  });
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
