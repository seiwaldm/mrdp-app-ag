<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { store } from '$lib/store.svelte';

	onMount(async () => {
		// Wait for the session to be established
		// Supabase client processes the hash in the URL and triggers onAuthStateChange
		
		let checks = 0;
		const checkSession = setInterval(() => {
			if (store.session) {
				clearInterval(checkSession);
				goto(`${base}/`);
			} else if (checks > 30) { // Timeout after 6 seconds
				clearInterval(checkSession);
				if (!store.session) {
					// If still no session, maybe it failed or was already handled
					goto(`${base}/login`);
				} else {
					goto(`${base}/`);
				}
			}
			checks++;
		}, 200);
	});
</script>

<div class="callback-container">
	<div class="spinner"></div>
	<p>Authentifizierung wird abgeschlossen...</p>
</div>

<style>
	.callback-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		gap: 1.5rem;
		background-color: var(--color-bg-base);
		color: var(--color-text-primary);
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid var(--color-border);
		border-top: 4px solid var(--color-accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	p {
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}
</style>
