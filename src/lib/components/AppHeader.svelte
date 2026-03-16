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
					<span class="app-mark">⊕</span>
					<span class="app-name font-display">{title}</span>
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
		font-size: 1.5rem;
		font-weight: 600;
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
