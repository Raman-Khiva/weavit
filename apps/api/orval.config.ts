import { defineConfig } from 'orval';

export default defineConfig({
    api: {
        input: '../../openapi.json', // Points from apps/api/ up to the monorepo root
        output: {
            mode: 'single',
            target: './src/zod/api.ts',
            client: 'zod',
        },
    },
});