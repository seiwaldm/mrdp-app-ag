<script lang="ts">
	import { base } from '$app/paths';
	import { store } from '$lib/store.svelte';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import logoLight from '$lib/assets/Logo-horizontal-Claim-CMYK.png';
	import logoDark from '$lib/assets/Logo-horizontal-Claim-CMYK_negativ.png';

	let email = $state('');
	let loading = $state(false);
	let message = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	onMount(() => {
		if (store.session) {
			goto(`${base}/`);
		}
	});

	async function handleLogin(e: Event) {
		e.preventDefault();
		if (!email) return;
		
		loading = true;
		message = null;

		try {
			await store.signInWithMagicLink(email);
			message = { 
				type: 'success', 
				text: 'Magic Link wurde gesendet! Bitte überprüfe dein E-Mail-Postfach.' 
			};
		} catch (err: any) {
			console.error('Login error:', err);
			message = { 
				type: 'error', 
				text: err.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' 
			};
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login | MRDP</title>
</svelte:head>

<div class="login-container">
	<div class="glow-effect"></div>
	
	<main class="login-card" in:fade={{ duration: 400 }}>
		<header class="login-header">
			<div class="logo">
				<img 
					src={store.theme === 'light' ? logoLight : logoDark} 
					alt="MRDP Logo" 
					class="login-logo"
				
				/>
			</div>
			<h1 class="font-display">Willkommen zurück</h1>
			<p class="subtitle">Gib deine E-Mail-Adresse ein, um einen Magic Link zu erhalten.</p>
		</header>

		<form onsubmit={handleLogin} class="login-form">
			<div class="input-group">
				<label for="email">E-Mail</label>
				<input 
					type="email" 
					id="email" 
					bind:value={email} 
					placeholder="name@beispiel.at" 
					required
					disabled={loading || !!(message && message.type === 'success')}
				/>
			</div>

			{#if message}
				<div class="message {message.type}" transition:fade>
					<span class="icon">{message.type === 'success' ? '✓' : '⚠️'}</span>
					<p>{message.text}</p>
				</div>
			{/if}

			{#if !(message && message.type === 'success')}
				<button type="submit" class="submit-btn" disabled={loading}>
					{#if loading}
						<span class="spinner"></span>
						Wird gesendet...
					{:else}
						Magic Link senden
					{/if}
				</button>
			{/if}
		</form>

		
	</main>
</div>

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-bg-base);
		position: relative;
		overflow: hidden;
		padding: 1rem;
	}

	.glow-effect {
		position: absolute;
		top: -10%;
		right: -10%;
		width: 50%;
		height: 50%;
		background: radial-gradient(circle, var(--color-accent-dim) 0%, transparent 70%);
		opacity: 0.3;
		filter: blur(80px);
		z-index: 0;
	}

	.login-card {
		width: 100%;
		max-width: 420px;
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 2.5rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
		position: relative;
		z-index: 1;
	}

	.login-header {
		text-align: center;
		margin-bottom: 2.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.logo {
		margin-bottom: 1.5rem;
		display: flex;
		justify-content: center;
	}

	.login-logo {
		height: 92px;
		width: auto;
		display: block;
	}

	h1 {
		font-size: 2rem;
		margin: 0 0 0.5rem 0;
		color: var(--color-text-primary);
	}

	.subtitle {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	input {
		padding: 0.875rem 1rem;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: 1rem;
		transition: all 200ms ease;
	}

	input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 1px var(--color-accent);
	}

	input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.submit-btn {
		background-color: var(--color-accent);
		color: #000;
		font-weight: 600;
		padding: 0.875rem;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-size: 1rem;
		transition: all 200ms ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.submit-btn:hover:not(:disabled) {
		filter: brightness(1.1);
		transform: translateY(-1px);
	}

	.submit-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.message {
		padding: 1rem;
		border-radius: var(--radius-sm);
		display: flex;
		gap: 0.75rem;
		font-size: 0.875rem;
		line-height: 1.4;
	}

	.message.success {
		background-color: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.2);
		color: #4ade80;
	}

	.message.error {
		background-color: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		color: #f87171;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(0, 0, 0, 0.2);
		border-top-color: #000;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.login-footer {
		margin-top: 3rem;
		text-align: center;
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
</style>
