<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { store } from '$lib/store.svelte';
	import '../app.css';
	

	let { children } = $props();

	// Route protection
	$effect(() => {
		if (!store.loading) {
			const isAuthPage = $page.url.pathname.includes('/login') || $page.url.pathname.includes('/auth/callback');
			if (!store.session && !isAuthPage) {
				goto(`${base}/login`);
			}
		}
	});

	onMount(() => {
		store.init();
	});
</script>



{#if store.loading}
	<div class="loading-screen">
		<div class="spinner"></div>
		<p>Lade Daten von Supabase...</p>
	</div>
{:else if store.error && !store.session}
	<div class="error-screen">
		<h2>Fehler beim Laden</h2>
		<p>{store.error}</p>
		<button onclick={() => store.init()}>Erneut versuchen</button>
	</div>
{:else}
	{@render children()}
{/if}

<style>
	.loading-screen, .error-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		gap: 1rem;
		background-color: var(--color-bg-base);
		color: var(--color-text-primary);
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid var(--color-border);
		border-top: 4px solid var(--color-accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	button {
		padding: 0.5rem 1rem;
		background-color: var(--color-accent);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
