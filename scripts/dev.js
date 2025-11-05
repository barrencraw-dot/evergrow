#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const processes = [];
const exitSignals = ['SIGINT', 'SIGTERM'];

const run = (command, args, name, env = {}) => {
    const child = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, ...env },
        shell: process.platform === 'win32',
    });

    const forwardOutput = (stream, printer) => {
        const rl = createInterface({ input: stream });
        rl.on('line', (line) => {
            printer(`[${name}] ${line}`);
        });
        rl.on('close', () => {
            printer(`[${name}] process ended`);
        });
    };

    forwardOutput(child.stdout, console.log);
    forwardOutput(child.stderr, console.error);

    child.on('exit', (code) => {
        if (code !== null && code !== 0) {
            console.error(`[${name}] exited with code ${code}`);
        }
    });

    processes.push(child);
};

const shutdown = () => {
    processes.forEach((child) => {
        if (!child.killed) {
            child.kill('SIGTERM');
        }
    });
};

exitSignals.forEach((signal) => {
    process.on(signal, () => {
        shutdown();
        process.exit(0);
    });
});

run('node', ['scripts/serve-frontend.js'], 'frontend');
run('node', ['EverGrow/backend-server.js'], 'backend');
