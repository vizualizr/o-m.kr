/** @type {import('tailwindcss').Config} */

// material tailwind added on 2025-01-27
const withMT = require("@material-tailwind/html/utils/withMT");

export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {},
	},
	plugins: [],
	vite: {
		ssr: {
			noExternal: ["@material-tailwind/react", "@material-tailwind/html"],
		},
	},
};

module.exports = withMT({
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	["./node_modules/flyonui/dist/js/*.js"],
	theme: {
		extend: {},
	},
	plugins: [
		require("flyonui"),
		require("flyonui/plugin") 
	  ]
});
