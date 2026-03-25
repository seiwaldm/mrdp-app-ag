<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import { store } from '$lib/store.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';

	let { children } = $props();

	// Admin-only route guard
	$effect(() => {
		if (!store.loading && store.userRole !== 'admin') {
			goto(`${base}/`);
		}
	});

	const navItems = [
		{ href: `${base}/admin/kandidaten`, label: 'Kandidaten', icon: '👤' },
		{ href: `${base}/admin/kommissionsmitglieder`, label: 'Kommission', icon: '👥' },
		{ href: `${base}/admin/faecher`, label: 'Fächer', icon: '📚' },
		{ href: `${base}/admin/themengebiete`, label: 'Themengebiete', icon: '📋' },
		{ href: `${base}/admin/antritte`, label: 'Antritte', icon: '📝' },
	];
</script>

<div class="admin-shell">
	<AppHeader showBackButton={true} title="Admin" />

	<div class="admin-layout">
		<nav class="admin-nav">
			<a href="{base}/admin" class="nav-item nav-overview" class:active={$page.url.pathname === `${base}/admin` || $page.url.pathname === `${base}/admin/`}>
				<span class="nav-icon">⚙</span>
				<span class="nav-label">Übersicht</span>
			</a>
			<div class="nav-divider"></div>
			{#each navItems as item}
				{#if item.label === 'Antritte'}
					<div class="nav-divider"></div>
				{/if}
				<a href={item.href} class="nav-item" class:active={$page.url.pathname.startsWith(item.href)} class:nav-item-special={item.label === 'Antritte'}>
					<span class="nav-icon">{item.icon}</span>
					<span class="nav-label">{item.label}</span>
				</a>
			{/each}
		</nav>

		<main class="admin-content">
			{@render children()}
		</main>
	</div>
</div>

<style>
	.admin-shell {
		min-height: 100vh;
		background-color: var(--color-bg-base);
	}

	.admin-layout {
		display: flex;
		max-width: 1400px;
		margin: 0 auto;
		padding: 1.5rem 2rem;
		gap: 2rem;
	}

	.admin-nav {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 200px;
		padding: 1rem;
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		height: fit-content;
		position: sticky;
		top: 5rem;
	}

	.nav-divider {
		height: 1px;
		background-color: var(--color-border);
		margin: 0.375rem 0;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.625rem 0.875rem;
		border-radius: var(--radius-sm);
		text-decoration: none;
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 150ms;
	}

	.nav-item:hover {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-primary);
	}

	.nav-item.active {
		background-color: rgba(232, 197, 71, 0.1);
		color: var(--color-accent);
		border: 1px solid rgba(232, 197, 71, 0.2);
	}

	.nav-item-special {
		background-color: rgba(232, 197, 71, 0.03);
		border: 1px dashed var(--color-border);
	}

	.nav-item-special:hover {
		border-style: solid;
	}

	.nav-icon {
		font-size: 1.125rem;
		width: 1.5rem;
		text-align: center;
	}

	.nav-overview .nav-icon {
		font-size: 1rem;
	}

	.admin-content {
		flex: 1;
		min-width: 0;
	}

	@media (max-width: 768px) {
		.admin-layout {
			flex-direction: column;
			padding: 1rem;
			gap: 1rem;
		}

		.admin-nav {
			flex-direction: row;
			overflow-x: auto;
			min-width: unset;
			position: static;
			padding: 0.5rem;
		}

		.nav-divider {
			width: 1px;
			height: auto;
			margin: 0 0.25rem;
		}

		.nav-label {
			white-space: nowrap;
		}
	}
</style>
