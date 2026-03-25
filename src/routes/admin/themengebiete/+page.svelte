<script lang="ts">
	import AdminTable, { type ColumnDef } from '$lib/components/AdminTable.svelte';
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';

	let data = $state<any[]>([]);
	let loading = $state(true);

	let columns = $derived<ColumnDef[]>([
		{ key: 'nr', label: 'Nr', type: 'number', required: true },
		{ key: 'bezeichnung', label: 'Bezeichnung', type: 'text', required: true },
		{
			key: 'fach_id',
			label: 'Fach',
			type: 'select',
			dbKey: 'fach_id',
			options: store.faecher.map(f => ({ value: f.id, label: `${f.bezeichnung} (${f.kurzform})` }))
		},
	]);

	async function loadData() {
		loading = true;
		const { data: rows } = await supabase.from('themengegebiete').select('*').order('id');
		data = (rows || []);
		loading = false;
	}

	$effect(() => {
		loadData();
	});
</script>

<div class="crud-page">
	<h1 class="page-title font-display">Themengebiete</h1>
	<p class="page-subtitle">Themengebiete pro Fach verwalten</p>

	{#if loading}
		<div class="loading">Laden…</div>
	{:else}
		<AdminTable
			tableName="themengegebiete"
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
