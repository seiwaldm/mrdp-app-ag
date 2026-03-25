<script lang="ts">
	import AdminTable, { type ColumnDef } from '$lib/components/AdminTable.svelte';
	import { supabase } from '$lib/supabase';
	import type { Kandidat } from '$lib/types';

	let data = $state<Kandidat[]>([]);
	let loading = $state(true);

	const columns: ColumnDef[] = [
		{ key: 'vorname', label: 'Vorname', type: 'text', required: true },
		{ key: 'nachname', label: 'Nachname', type: 'text', required: true },
		{ 
			key: 'klasse', 
			label: 'Klasse', 
			type: 'select', 
			required: true,
			options: [
				{ value: '5AHK', label: '5AHK' },
				{ value: '5BHK', label: '5BHK' },
				{ value: '5CHK', label: '5CHK' }
			]
		},
	];

	async function loadData() {
		loading = true;
		const { data: rows } = await supabase.from('kandidaten').select('*').order('id');
		data = (rows || []) as Kandidat[];
		loading = false;
	}

	$effect(() => {
		loadData();
	});
</script>

<div class="crud-page">
	<h1 class="page-title font-display">Kandidaten</h1>
	<p class="page-subtitle">Prüfungskandidaten verwalten</p>

	{#if loading}
		<div class="loading">Laden…</div>
	{:else}
		<AdminTable
			tableName="kandidaten"
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
