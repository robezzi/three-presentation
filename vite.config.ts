import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@assets': path.resolve(__dirname, './src/assets'),
			'@components': path.resolve(__dirname, './src/components'),
		},
	},
	plugins: [react(), tailwindcss()],
	assetsInclude: ['**/*.glb', '**/*.wasm'],

	optimizeDeps: {
		exclude: ['@react-three/rapier'],
	},
});
