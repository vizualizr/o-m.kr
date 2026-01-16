import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        watch: {
            ignored: ['**/.agent/**', '**/node_modules/**', '**/.github/**', '**/.resource/**', '**/.vscode/**']
        },
        // host: '0.0.0.0', // Allows access from any host
        // list of hosts allowed
        cors: {
            origin: ['https://100.64.0.100', 'http://localhost', 'http://notebook01.gate-truck.ts.net'],
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type']
        },
    },
});