import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: '404.html',
			strict: false
		}),
		paths: {
			base: (process.env.NODE_ENV === 'production' || process.env.GITHUB_ACTIONS === 'true') ? '/mrdp-app-ag' : '',
		}
	},
	vitePlugin: {
		dynamicCompileOptions: ({ filename }) =>
			filename.includes('node_modules') ? undefined : { runes: true }
	}
};

export default config;
