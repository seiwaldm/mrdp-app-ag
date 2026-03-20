<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { store } from '$lib/store.svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

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

	async function handleSignOut() {
		try {
			await store.signOut();
			goto(`${base}/login`);
		} catch (e) {
			console.error('Sign out failed:', e);
		}
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

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
	{#if store.session}
		<div class="auth-bar">
			<span class="user-email">{store.user?.email}</span>
			<button class="signout-btn" onclick={handleSignOut}>Abmelden</button>
		</div>
	{/if}
	{@render children()}
{/if}

<style>
	.auth-bar {
		position: fixed;
		top: 1rem;
		right: 1rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		z-index: 1000;
		background: var(--color-bg-surface);
		padding: 0.5rem 1rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.user-email {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.signout-btn {
		font-size: 0.75rem;
		padding: 0.25rem 0.75rem !important;
		background-color: transparent !important;
		border: 1px solid var(--color-border) !important;
		color: var(--color-text-primary) !important;
	}

	.signout-btn:hover {
		border-color: var(--color-accent) !important;
		color: var(--color-accent) !important;
	}

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
