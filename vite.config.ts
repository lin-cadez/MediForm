import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			injectRegister: null,
			includeAssets: [
				"favicon.ico",
				"favicon.svg",
				"apple-touch-icon.png",
				"Izvoz.jpg",
				"logo_only.png",
				"logo_with_text.png",
				"CNAME",
				"fonts/**/*",
			],
			manifest: {
				id: "/",
				name: "MediForm - Zdravstveni obrazci",
				short_name: "MediForm",
				description: "Aplikacija za izpolnjevanje zdravstvenih obrazcev za dijake",
				theme_color: "#0e7490",
				background_color: "#f0f9ff",
				display: "standalone",
				orientation: "portrait",
				scope: "/",
				start_url: "/",
				lang: "sl",
				categories: ["education", "medical", "productivity"],
				icons: [
					{
						src: "/web-app-manifest-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any maskable",
					},
					{
						src: "/web-app-manifest-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
					{
						src: "/apple-touch-icon.png",
						sizes: "180x180",
						type: "image/png",
						purpose: "any",
					},
				],
				screenshots: [
					{
						src: "/Izvoz.jpg",
						sizes: "3120x1755",
						type: "image/jpeg",
						form_factor: "wide",
					},
				],
			},
			workbox: {
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				skipWaiting: true,
				navigateFallback: "/index.html",
				navigateFallbackDenylist: [/^\/api\//],
				globPatterns: ["**/*.{js,css,html,ico,png,svg,json,jpg,jpeg,webp,woff,woff2,ttf}"],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "google-fonts-stylesheets",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
						},
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "google-fonts-webfonts",
							expiration: {
								maxEntries: 30,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
						},
					},
					{
						urlPattern: /^https:\/\/medi-form-backend\.vercel\.app\/api\/.*/i,
						handler: "NetworkOnly",
						options: {
							cacheName: "api-network-only",
						},
					},
					{
						urlPattern: /^https:\/\/mediform-backend.*\.vercel\.app\/api\/.*/i,
						handler: "NetworkOnly",
						options: {
							cacheName: "api-network-only",
						},
					},
				],
			},
		}),
	],
	server: {
		port: 3000,
		open: true,
	},
	base: "/",
	build: {
		outDir: "build",
		emptyOutDir: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
