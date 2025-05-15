import { defineConfig } from 'vite';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    server: {
        // host: '0.0.0.0', // Allows access from any host
        // list of hosts allowed
        cors: {
            origin: ['https://100.64.0.100', 'http://localhost', 'http://notebook01.gate-truck.ts.net'],
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type']
        },
        allowedHosts: ['notebook01.gate-truck.ts.net'] //added this
    },
    plugins: [
        tailwindcss(),
    ],
});