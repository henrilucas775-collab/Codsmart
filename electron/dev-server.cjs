const { spawn } = require('node:child_process');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const viteBin = path.join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');
const electronBin = path.join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron');

function startVite() {
  return new Promise((resolve, reject) => {
    const vite = spawn(viteBin, ['--host', '127.0.0.1', '--port', '5173'], {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, BROWSER: 'none' }
    });

    let output = '';

    const onData = (chunk) => {
      output += chunk.toString();
      const match = output.match(/Local:\s+http:\/\/(?:127\.0\.0\.1|localhost):(\d+)/i);
      if (match) {
        vite.stdout.off('data', onData);
        vite.stderr.off('data', onData);
        resolve(Number(match[1]));
      }
    };

    vite.stdout.on('data', onData);
    vite.stderr.on('data', onData);

    vite.on('error', (error) => reject(error));
    vite.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`Vite exited with code ${code}`));
      }
    });
  });
}

function startElectron(port) {
  const electron = spawn(electronBin, ['.'], {
    cwd: rootDir,
    stdio: 'inherit',
    env: { ...process.env, VITE_PORT: String(port) }
  });

  electron.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  electron.on('error', (error) => {
    console.error('Failed to start Electron:', error);
    process.exit(1);
  });
}

startVite()
  .then((port) => {
    console.log(`Using Vite on port ${port}`);
    startElectron(port);
  })
  .catch((error) => {
    console.error('Unable to start Vite dev server:', error);
    process.exit(1);
  });
