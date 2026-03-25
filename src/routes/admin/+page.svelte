<script lang="ts">
	import { store } from '$lib/store.svelte';
	import { base } from '$app/paths';

	const tables = [
		{ href: `${base}/admin/kandidaten`, label: 'Kandidaten', icon: '👤', description: 'Prüfungskandidaten verwalten', get count() { return store.kandidaten.length; } },
		{ href: `${base}/admin/kommissionsmitglieder`, label: 'Kommission', icon: '👥', description: 'Prüfer, Beisitzer und KVs', get count() { return store.kommission.length; } },
		{ href: `${base}/admin/faecher`, label: 'Fächer', icon: '📚', description: 'Prüfungsfächer verwalten', get count() { return store.faecher.length; } },
		{ href: `${base}/admin/themengebiete`, label: 'Themengebiete', icon: '📋', description: 'Themengebiete pro Fach', get count() { return store.themengebiete.length; } },
		{ href: `${base}/admin/antritte`, label: 'Antritte', icon: '📝', description: 'Prüfungsantritte verwalten', get count() { return store.antritte.length; } },
	];
</script>

<div class="admin-dashboard">
	<h1 class="dashboard-title font-display">Datenverwaltung</h1>
	<p class="dashboard-subtitle">Stammdaten der Reifeprüfung verwalten</p>

	<div class="card-grid">
		{#each tables as table}
			{#if table.label === 'Antritte'}
				<div class="grid-divider"></div>
			{/if}
			<a href={table.href} class="table-card" class:special-card={table.label === 'Antritte'}>
				<div class="card-icon">{table.icon}</div>
				<div class="card-body">
					<h2 class="card-title">{table.label}</h2>
					<p class="card-desc">{table.description}</p>
				</div>
				<div class="card-count">
					<span class="count-number">{table.count}</span>
					<span class="count-label">Einträge</span>
				</div>
				<div class="card-arrow">→</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.admin-dashboard {
		padding: 0.5rem 0;
	}

	.dashboard-title {
		font-size: 1.75rem;
		color: var(--color-text-primary);
		margin: 0 0 0.25rem;
	}

	.dashboard-subtitle {
		font-size: 0.9375rem;
		color: var(--color-text-muted);
		margin: 0 0 2rem;
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.table-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--color-text-primary);
		transition: all 200ms;
	}

	.table-card:hover {
		border-color: var(--color-accent);
		background-color: var(--color-bg-elevated);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.grid-divider {
		grid-column: 1 / -1;
		height: 1px;
		background-color: var(--color-border);
		margin: 0.5rem 0;
	}

	.special-card {
		border: 1px dashed var(--color-border);
		background-color: rgba(232, 197, 71, 0.03);
	}

	.special-card:hover {
		border-style: solid;
	}

	.card-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.card-body {
		flex: 1;
		min-width: 0;
	}

	.card-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.125rem;
		color: var(--color-text-primary);
	}

	.card-desc {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.card-count {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-shrink: 0;
		padding: 0.375rem 0.75rem;
		background-color: var(--color-bg-elevated);
		border-radius: var(--radius-sm);
	}

	.count-number {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-accent);
		font-family: var(--font-mono);
	}

	.count-label {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.card-arrow {
		font-size: 1.25rem;
		color: var(--color-text-muted);
		flex-shrink: 0;
		transition: all 200ms;
	}

	.table-card:hover .card-arrow {
		color: var(--color-accent);
		transform: translateX(3px);
	}
</style>
