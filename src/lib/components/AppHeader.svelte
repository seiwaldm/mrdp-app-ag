<script lang="ts">
	let {
		showBackButton = false,
		title = 'MRDP',
		subtitle = '',
		availableDates = [],
		selectedDate = $bindable(null)
	}: {
		showBackButton?: boolean;
		title?: string;
		subtitle?: string;
		availableDates?: string[];
		selectedDate?: string | null;
	} = $props();

	import ThemeToggle from './ThemeToggle.svelte';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { store } from '$lib/store.svelte';
	import logoLight from '$lib/assets/Logo-horizontal-Claim-CMYK.png';
	import logoDark from '$lib/assets/Logo-horizontal-Claim-CMYK_negativ.png';

	async function handleSignOut() {
		try {
			await store.signOut();
			goto(`${base}/login`);
		} catch (e) {
			console.error('Sign out failed:', e);
		}
	}

	function formatDate(dateStr: string) {
		if (!dateStr) return '';
		const d = new Date(dateStr);
		return d.toLocaleDateString('de-DE', { 
			weekday: 'long', 
			day: '2-digit', 
			month: 'long', 
			year: 'numeric' 
		});
	}
</script>

<header class="app-header">
	<div class="header-content">
		<div class="header-left">
			{#if showBackButton}
				<a href="{base}/" class="back-button">← Zurück</a>
			{:else}
				<div class="app-title">
					<img 
						src={store.theme === 'light' ? logoLight : logoDark} 
						alt="MRDP Logo" 
						class="app-logo"
						
					/>
				</div>
			{/if}
		</div>
		
		{#if subtitle || availableDates.length > 0}
			<div class="header-center">
				{#if availableDates.length > 1}
					<div class="date-selector-wrapper">
						<select 
							bind:value={selectedDate} 
							class="date-select font-display"
						>
							{#each availableDates as date}
								<option value={date}>{formatDate(date)}</option>
							{/each}
						</select>
						<span class="select-arrow">▾</span>
					</div>
				{:else if availableDates.length === 1}
					<span class="date-text font-display">{formatDate(availableDates[0])}</span>
				{/if}
				
				{#if subtitle}
					<div class="subtitle-container">
						<span class="subtitle">{subtitle}</span>
					</div>
				{/if}
			</div>
		{/if}
		
		<div class="header-right">
			{#if store.session}
				{#if store.userRole === 'admin'}
					<a href="{base}/admin" class="admin-link" title="Admin-Bereich">⚙</a>
				{/if}
				<div class="user-info">
					<span class="user-email">{store.user?.email}</span>
					<button type="button" class="logout-btn" onclick={handleSignOut}>Abmelden</button>
				</div>
			{/if}
			<ThemeToggle />
		</div>
	</div>
</header>

<style>
	.app-header {
		position: sticky;
		top: 0;
		z-index: 50;
		background-color: var(--color-bg-base);
		border-bottom: 1px solid var(--color-border);
	}
	
	:root:not(.light) .app-header {
		background-color: rgba(15, 17, 23, 0.95);
		backdrop-filter: blur(12px);
	}

	:root.light .app-header {
		background-color: rgba(248, 250, 252, 0.8);
		backdrop-filter: blur(12px);
	}
	
	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 1400px;
		margin: 0 auto;
		padding: 1rem 2rem;
		gap: 1rem;
	}
	
	.header-left {
		flex: 1;
	}
	
	.app-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	@media (max-width: 500px) {
		.app-logo {
			display: none;
		}
	}

	.app-logo {
		height: 64px;
		width: auto;
		display: block;
		object-fit: contain;
	}
	
	.back-button {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1rem;
		color: var(--color-text-secondary);
		text-decoration: none;
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		transition: all 150ms;
	}
	
	.back-button:hover {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-primary);
	}
	
	.header-center {
		flex: 2;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
	}
	
	.subtitle {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.date-text {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.date-selector-wrapper {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	.date-select {
		appearance: none;
		background: transparent;
		border: 1px solid transparent;
		color: var(--color-text-primary);
		font-size: 1.5rem;
		font-weight: 600;
		padding: 0.25rem 2rem 0.25rem 0.75rem;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s;
	}

	.date-select:hover {
		background-color: var(--color-bg-elevated);
		border-color: var(--color-border);
	}

	.select-arrow {
		position: absolute;
		right: 0.75rem;
		pointer-events: none;
		font-size: 1rem;
		color: var(--color-text-muted);
	}
	
	.header-right {
		flex: 1;
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		align-items: center;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-right: 0.5rem;
		padding-right: 0.75rem;
		border-right: 1px solid var(--color-border);
	}

	.user-email {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.logout-btn {
		padding: 0.4rem 0.8rem;
		background-color: transparent;
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 150ms;
	}
	
	.admin-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		font-size: 1.25rem;
		color: var(--color-text-secondary);
		text-decoration: none;
		border-radius: var(--radius-sm);
		transition: all 150ms;
	}

	.admin-link:hover {
		background-color: var(--color-bg-elevated);
		color: var(--color-accent);
	}

	.logout-btn:hover {
		background-color: var(--color-bg-elevated);
		border-color: var(--color-accent);
		color: var(--color-accent);
	}
	
	@media (max-width: 640px) {
		.header-content {
			padding: 0.5rem 0.75rem;
			gap: 0.5rem;
		}
		
		.header-left {
			flex: 0 0 auto;
		}

		.app-logo {
			display: none;
		}

		.header-center {
			flex: 1;
			display: flex !important;
			text-align: center;
		}

		.date-select {
			font-size: 1.125rem;
			padding: 0.25rem 1.5rem 0.25rem 0.5rem;
		}

		.date-text {
			font-size: 1rem;
		}

		.subtitle-container {
			display: none;
		}

		.header-right {
			flex: 0 0 auto;
			gap: 0.5rem;
		}

		.user-email {
			display: none;
		}

		.user-info {
			margin-right: 0;
			padding-right: 0;
			border-right: none;
		}
	}
</style>
