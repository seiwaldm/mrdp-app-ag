<script lang="ts">
	let {
		showBackButton = false,
		title = 'MRDP',
		subtitle = ''
	}: {
		showBackButton?: boolean;
		title?: string;
		subtitle?: string;
	} = $props();

	import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="app-header">
	<div class="header-content">
		<div class="header-left">
			{#if showBackButton}
				<a href="/" class="back-button">← Zurück</a>
			{:else}
				<div class="app-title">
					<span class="app-mark">⊕</span>
					<span class="app-name font-display">{title}</span>
				</div>
			{/if}
		</div>
		
		{#if subtitle}
			<div class="header-center">
				<span class="subtitle">{subtitle}</span>
			</div>
		{/if}
		
		<div class="header-right">
			<ThemeToggle />
			<button type="button" class="logout-btn">Logout</button>
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
	
	.app-mark {
		font-size: 1.5rem;
		color: var(--color-accent);
	}
	
	.app-name {
		font-size: 1.25rem;
		font-weight: 400;
		color: var(--color-text-primary);
		letter-spacing: 0.05em;
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
	}
	
	.subtitle {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}
	
	.header-right {
		flex: 1;
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		align-items: center;
	}
	
	.logout-btn {
		padding: 0.5rem 1rem;
		background-color: transparent;
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 150ms;
	}
	
	.logout-btn:hover {
		background-color: var(--color-bg-elevated);
		border-color: var(--color-text-muted);
		color: var(--color-text-primary);
	}
	
	@media (max-width: 640px) {
		.header-content {
			padding: 0.75rem 1rem;
		}
		
		.header-center {
			display: none;
		}
	}
</style>
