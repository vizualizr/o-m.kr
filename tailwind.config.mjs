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
			colors: {
				coriander: {
					50: "#f3f7ee",
					100: "#e5ecdb",
					200: "#cedcbc",
					300: "#aec492",
					400: "#8fad6e",
					500: "#729151",
					600: "#58733d",
					700: "#455932",
					800: "#39482c",
					900: "#323f28",
					950: "#192112",
				},
				paper: {
					50: "#F3F2F2",
					100: "#F1EEEE",
					200: "#F3EEED",
					300: "#F3EFE7",
					400: "#D4C5BF",
					500: "#B09C9D",
					600: "#857F82",
					700: "#5C5C5C",
					800: "#383838",
					900: "#141414",
					950: "#030303",
				},
			},
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
