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
	content: [
		"./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
		"./node_modules/flyonui/dist/js/*.js",
	],
	theme: {
		extend: {
			mixBlendMode: {
				normal: "normal",
				multiply: "multiply",
				screen: "screen",
				overlay: "overlay",
				darken: "darken",
				lighten: "lighten",
				colorDodge: "color-dodge",
				colorBurn: "color-burn",
				hardLight: "hard-light",
				softLight: "soft-light",
				difference: "difference",
				exclusion: "exclusion",
				hue: "hue",
				saturation: "saturation",
				color: "color",
				luminosity: "luminosity",
			},
		},
	},
	variants: {
		mixBlendMode: ["responsive"],
	},
	plugins: [require("flyonui"), require("flyonui/plugin")],
});
