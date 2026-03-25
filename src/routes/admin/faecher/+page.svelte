<script lang="ts">
	import AdminTable, { type ColumnDef } from '$lib/components/AdminTable.svelte';
	import { supabase } from '$lib/supabase';
	import type { Fach } from '$lib/types';

	let data = $state<Fach[]>([]);
	let loading = $state(true);

	const columns: ColumnDef[] = [
		{ key: 'bezeichnung', label: 'Bezeichnung', type: 'text', required: true },
		{ key: 'kurzform', label: 'Kurzform', type: 'text', required: true },
	];

	async function loadData() {
		loading = true;
		const { data: rows } = await supabase.from('faecher').select('*').order('id');
		data = (rows || []) as Fach[];
		loading = false;
	}

	$effect(() => {
		loadData();
	});
</script>

<div class="crud-page">
	<h1 class="page-title font-display">Fächer</h1>
	<p class="page-subtitle">Prüfungsfächer verwalten</p>

	{#if loading}
		<div class="loading">Laden…</div>
	{:else}
		<AdminTable
			tableName="faecher"
			{columns}
			bind:data={data}
			onRefresh={loadData}
		/>
	{/if}
</div>

<style>
	.crud-page { padding: 0.5rem 0; }
	.page-title { font-size: 1.5rem; color: var(--color-text-primary); margin: 0 0 0.25rem; }
	.page-subtitle { font-size: 0.875rem; color: var(--color-text-muted); margin: 0 0 1.5rem; }
	.loading { padding: 2rem; text-align: center; color: var(--color-text-muted); }
</style>
