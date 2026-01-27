<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	// Initialize theme before page renders to prevent flash
	onMount(() => {
		if (typeof window === 'undefined') return;

		const theme = localStorage.getItem('theme') || 'system';
		const html = document.documentElement;

		if (theme === 'system') {
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
			if (systemTheme === 'dark') {
				html.classList.add('dark');
			} else {
				html.classList.remove('dark');
			}
		} else if (theme === 'dark') {
			html.classList.add('dark');
		} else {
			html.classList.remove('dark');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<script>
		// Prevent flash of unstyled content by setting theme immediately
		(function () {
			const theme = localStorage.getItem('theme') || 'system';
			const html = document.documentElement;
			if (theme === 'system') {
				const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light';
				if (systemTheme === 'dark') {
					html.classList.add('dark');
				}
			} else if (theme === 'dark') {
				html.classList.add('dark');
			}
		})();
	</script>
</svelte:head>

{@render children()}
