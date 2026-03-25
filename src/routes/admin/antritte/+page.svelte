<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import type { Fach, Kandidat } from '$lib/types';

	let data = $state<any[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state<string | null>(null);

	// New entry form
	let addingNew = $state(false);
	let newKandidatId = $state<number | string>('');
	let newFachId = $state<number | string>('');
	let newDate = $state('');
	let newJahresnote = $state<number | string>('');

	// Edit state
	let editingId = $state<number | string | null>(null);
	let editKandidatId = $state<number | string>('');
	let editFachId = $state<number | string>('');
	let editDate = $state('');
	let editJahresnote = $state<number | string>('');

	// Delete state
	let deletingId = $state<number | string | null>(null);

	let sortKey = $state<string | null>(null);
	let sortOrder = $state<'asc' | 'desc'>('asc');

	let sortedData = $derived(() => {
		if (!sortKey) return data;
		return [...data].sort((a, b) => {
			let valA = a[sortKey!];
			let valB = b[sortKey!];

			if (sortKey === 'kandidat_id') {
				valA = getKandidatName(a.kandidat_id);
				valB = getKandidatName(b.kandidat_id);
			} else if (sortKey === 'fach_id') {
				valA = getFachName(a.fach_id);
				valB = getFachName(b.fach_id);
			} else if (sortKey === 'start_vb') {
				valA = valA || '';
				valB = valB || '';
			}

			if (typeof valA === 'string' && typeof valB === 'string') {
				return sortOrder === 'asc' ? valA.localeCompare(valB, 'de') : valB.localeCompare(valA, 'de');
			}
			valA = valA ?? '';
			valB = valB ?? '';
			return sortOrder === 'asc' 
				? (valA > valB ? 1 : valA < valB ? -1 : 0)
				: (valA < valB ? 1 : valA > valB ? -1 : 0);
		});
	});

	function toggleSort(key: string) {
		if (sortKey === key) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortOrder = 'asc';
		}
	}

	async function loadData() {
		loading = true;
		const { data: rows } = await supabase
			.from('antritte')
			.select('id, kandidat_id, fach_id, start_vb, antritte_noten(jahresnote)')
			.order('id');
		data = (rows || []).map((r: any) => ({
			...r,
			jahresnote: (Array.isArray(r.antritte_noten) ? r.antritte_noten[0]?.jahresnote : r.antritte_noten?.jahresnote) ?? null
		}));
		loading = false;
	}

	$effect(() => {
		loadData();
	});

	function getKandidatName(id: number | string): string {
		const k = store.kandidaten.find(k => String(k.id) === String(id));
		return k ? `${k.nachname} ${k.vorname}` : '—';
	}

	function getFachName(id: number | string): string {
		const f = store.faecher.find(f => String(f.id) === String(id));
		return f ? `${f.bezeichnung} (${f.kurzform})` : '—';
	}

	function extractDate(iso: string | null): string {
		if (!iso) return '—';
		try {
			const d = new Date(iso);
			if (isNaN(d.getTime())) return '—';
			return d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
		} catch {
			return '—';
		}
	}

	function extractDateForInput(iso: string | null): string {
		if (!iso) return '';
		try {
			const d = new Date(iso);
			if (isNaN(d.getTime())) return '';
			const pad = (n: number) => String(n).padStart(2, '0');
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		} catch {
			return '';
		}
	}

	function startEdit(row: any) {
		editingId = row.id;
		editKandidatId = row.kandidat_id ?? '';
		editFachId = row.fach_id ?? '';
		editDate = extractDateForInput(row.start_vb);
		editJahresnote = row.jahresnote ?? '';
	}

	function cancelEdit() {
		editingId = null;
	}

	async function saveEdit(id: number | string) {
		saving = true;
		error = null;
		try {
			if (!editKandidatId || !editFachId || !editDate) {
				throw new Error('Kandidat, Fach und Datum sind erforderlich');
			}
			const startVb = new Date(`${editDate}T00:00:00`).toISOString();
			const { error: dbError } = await supabase
				.from('antritte')
				.update({
					kandidat_id: Number(editKandidatId),
					fach_id: Number(editFachId),
					start_vb: startVb
				})
				.eq('id', id);
			if (dbError) throw dbError;

			const jn = editJahresnote ? Number(editJahresnote) : null;
			const { error: notenError } = await supabase
				.from('antritte_noten')
				.update({ jahresnote: jn })
				.eq('id', id);
			if (notenError) throw notenError;

			editingId = null;
			await loadData();
			await store.init();
		} catch (e: any) {
			error = e.message || 'Fehler beim Speichern';
		} finally {
			saving = false;
		}
	}

	function startAdd() {
		addingNew = true;
		newKandidatId = '';
		newFachId = '';
		newDate = '';
		newJahresnote = '';
	}

	function cancelAdd() {
		addingNew = false;
	}

	async function saveNew() {
		saving = true;
		error = null;
		try {
			if (!newKandidatId || !newFachId || !newDate) {
				throw new Error('Kandidat, Fach und Datum sind erforderlich');
			}
			const startVb = new Date(`${newDate}T00:00:00`).toISOString();
			const { data: inserted, error: dbError } = await supabase
				.from('antritte')
				.insert({
					kandidat_id: Number(newKandidatId),
					fach_id: Number(newFachId),
					start_vb: startVb
				})
				.select('id')
				.single();
			if (dbError) throw dbError;

			// Create corresponding antritte_noten row
			if (inserted) {
				const jn = newJahresnote ? Number(newJahresnote) : null;
				await supabase.from('antritte_noten').insert({ id: inserted.id, jahresnote: jn });
			}

			addingNew = false;
			await loadData();
			await store.init();
		} catch (e: any) {
			error = e.message || 'Fehler beim Erstellen';
		} finally {
			saving = false;
		}
	}

	async function confirmDelete(id: number | string) {
		saving = true;
		error = null;
		try {
			// Delete noten first (FK dependency)
			await supabase.from('antritte_noten').delete().eq('id', id);
			const { error: dbError } = await supabase.from('antritte').delete().eq('id', id);
			if (dbError) throw dbError;
			deletingId = null;
			await loadData();
			await store.init();
		} catch (e: any) {
			error = e.message || 'Fehler beim Löschen';
		} finally {
			saving = false;
		}
	}

	let sortedKandidaten = $derived(
		[...store.kandidaten].sort((a, b) => a.nachname.localeCompare(b.nachname))
	);
</script>

<div class="crud-page">
	<h1 class="page-title font-display">Antritte</h1>
	<p class="page-subtitle">Prüfungsantritte verwalten — Kandidat, Fach und Datum zuweisen</p>

	{#if error}
		<div class="admin-error">
			<span>{error}</span>
			<button type="button" onclick={() => error = null}>✕</button>
		</div>
	{/if}

	{#if loading}
		<div class="loading">Laden…</div>
	{:else}
		<div class="admin-table-wrapper">
			<table class="admin-table">
				<thead>
					<tr>
						<th class="sortable-header" onclick={() => toggleSort('kandidat_id')}>
							<div class="header-content">	
								<span>Kandidat/in</span>
								<span class="sort-icon" class:active={sortKey === 'kandidat_id'}>{sortKey === 'kandidat_id' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
							</div>
						</th>
						<th class="sortable-header" onclick={() => toggleSort('fach_id')}>
							<div class="header-content">	
								<span>Fach</span>
								<span class="sort-icon" class:active={sortKey === 'fach_id'}>{sortKey === 'fach_id' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
							</div>
						</th>
						<th class="sortable-header" onclick={() => toggleSort('jahresnote')}>
							<div class="header-content">	
								<span>Jahresnote</span>
								<span class="sort-icon" class:active={sortKey === 'jahresnote'}>{sortKey === 'jahresnote' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
							</div>
						</th>
						<th class="sortable-header" onclick={() => toggleSort('start_vb')}>
							<div class="header-content">	
								<span>Datum</span>
								<span class="sort-icon" class:active={sortKey === 'start_vb'}>{sortKey === 'start_vb' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
							</div>
						</th>
						<th class="col-actions">Aktionen</th>
					</tr>
				</thead>
				<tbody>
					{#each sortedData() as row (row.id)}
						{#if editingId === row.id}
							<tr class="editing-row">
								<td>
									<select class="edit-input" bind:value={editKandidatId}>
										<option value="">— Auswählen —</option>
										{#each sortedKandidaten as k}
											<option value={k.id}>{k.nachname} {k.vorname} ({k.klasse})</option>
										{/each}
									</select>
								</td>
								<td>
									<select class="edit-input" bind:value={editFachId}>
										<option value="">— Auswählen —</option>
										{#each store.faecher as f}
											<option value={f.id}>{f.bezeichnung} ({f.kurzform})</option>
										{/each}
									</select>
								</td>
								<td>
									<select class="edit-input font-mono" bind:value={editJahresnote}>
										<option value="">—</option>
										<option value="1">1</option>
										<option value="2">2</option>
										<option value="3">3</option>
										<option value="4">4</option>
										<option value="5">5</option>
									</select>
								</td>
								<td>
									<input type="date" class="edit-input" bind:value={editDate} />
								</td>
								<td class="col-actions">
									<div class="action-group">
										<button type="button" class="btn-save" onclick={() => saveEdit(row.id)} disabled={saving}>
											{saving ? '…' : '✓'}
										</button>
										<button type="button" class="btn-cancel" onclick={cancelEdit} disabled={saving}>✕</button>
									</div>
								</td>
							</tr>
						{:else if deletingId === row.id}
							<tr class="deleting-row">
								<td colspan="5">
									<div class="delete-confirm">
										<span>Antritt #{row.id} wirklich löschen?</span>
										<button type="button" class="btn-delete-confirm" onclick={() => confirmDelete(row.id)} disabled={saving}>
											{saving ? '…' : 'Ja, löschen'}
										</button>
										<button type="button" class="btn-cancel" onclick={() => deletingId = null} disabled={saving}>Abbrechen</button>
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td>{getKandidatName(row.kandidat_id)}</td>
								<td>{getFachName(row.fach_id)}</td>
								<td>{row.jahresnote || '—'}</td>
								<td>{extractDate(row.start_vb)}</td>
								<td class="col-actions">
									<div class="action-group">
										<button type="button" class="btn-edit" onclick={() => startEdit(row)}>✎</button>
										<button type="button" class="btn-delete" onclick={() => deletingId = row.id}>🗑</button>
									</div>
								</td>
							</tr>
						{/if}
					{/each}

					{#if addingNew}
						<tr class="adding-row">
							<td>
								<select class="edit-input" bind:value={newKandidatId}>
									<option value="">— Auswählen —</option>
									{#each sortedKandidaten as k}
										<option value={k.id}>{k.nachname} {k.vorname} ({k.klasse})</option>
									{/each}
								</select>
							</td>
							<td>
								<select class="edit-input" bind:value={newFachId}>
									<option value="">— Auswählen —</option>
									{#each store.faecher as f}
										<option value={f.id}>{f.bezeichnung} ({f.kurzform})</option>
									{/each}
								</select>
							</td>
							<td>
								<select class="edit-input font-mono" bind:value={newJahresnote}>
									<option value="">—</option>
									<option value="1">1</option>
									<option value="2">2</option>
									<option value="3">3</option>
									<option value="4">4</option>
									<option value="5">5</option>
								</select>
							</td>
							<td>
								<input type="date" class="edit-input" bind:value={newDate} />
							</td>
							<td class="col-actions">
								<div class="action-group">
									<button type="button" class="btn-save" onclick={saveNew} disabled={saving}>
										{saving ? '…' : '✓'}
									</button>
									<button type="button" class="btn-cancel" onclick={cancelAdd} disabled={saving}>✕</button>
								</div>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		{#if !addingNew}
			<button type="button" class="btn-add" onclick={startAdd}>
				<span class="add-icon">＋</span> Neuen Antritt hinzufügen
			</button>
		{/if}
	{/if}
</div>

<style>
	.crud-page { padding: 0.5rem 0; }
	.page-title { font-size: 1.5rem; color: var(--color-text-primary); margin: 0 0 0.25rem; }
	.page-subtitle { font-size: 0.875rem; color: var(--color-text-muted); margin: 0 0 1.5rem; }
	.loading { padding: 2rem; text-align: center; color: var(--color-text-muted); }

	.admin-error {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		margin-bottom: 1rem;
		background-color: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: var(--radius-md);
		color: #fca5a5;
		font-size: 0.875rem;
	}

	:root.light .admin-error {
		background-color: rgba(239, 68, 68, 0.08);
		color: #dc2626;
	}

	.admin-error button {
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		font-size: 1rem;
		padding: 0.25rem;
		opacity: 0.7;
	}

	.admin-table-wrapper {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow-x: auto;
	}

	.admin-table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background-color: var(--color-bg-elevated);
		border-bottom: 1px solid var(--color-border);
	}

	th {
		padding: 0;
		text-align: left;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.sortable-header {
		cursor: pointer;
		user-select: none;
		transition: background-color 150ms;
	}

	.sortable-header:hover {
		background-color: rgba(0, 0, 0, 0.03);
	}

	:root.dark .sortable-header:hover {
		background-color: rgba(255, 255, 255, 0.03);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		gap: 0.5rem;
	}

	.sort-icon {
		font-size: 0.75rem;
		opacity: 0.2;
		transition: opacity 150ms;
	}

	.sort-icon.active {
		opacity: 1;
		color: var(--color-accent);
	}

	.sortable-header:hover .sort-icon:not(.active) {
		opacity: 0.5;
	}

	td {
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
		color: var(--color-text-primary);
		border-bottom: 1px solid var(--color-border);
		vertical-align: middle;
	}

	.col-actions { width: 6rem; text-align: right; padding: 0.75rem 1rem; }

	tr:hover:not(.editing-row):not(.adding-row):not(.deleting-row) {
		background-color: var(--color-bg-elevated);
	}

	.editing-row, .adding-row { background-color: rgba(232, 197, 71, 0.06); }
	.deleting-row { background-color: rgba(239, 68, 68, 0.06); }

	.edit-input {
		width: 100%;
		padding: 0.375rem 0.625rem;
		background-color: var(--color-bg-base);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: 0.875rem;
		font-family: inherit;
		outline: none;
		transition: border-color 150ms;
	}

	.edit-input:focus { border-color: var(--color-accent); }
	select.edit-input { cursor: pointer; }

	.action-group {
		display: flex;
		gap: 0.375rem;
		justify-content: flex-end;
	}

	.btn-edit, .btn-delete, .btn-save, .btn-cancel, .btn-delete-confirm {
		padding: 0.375rem 0.625rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background-color: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		font-size: 0.8125rem;
		transition: all 150ms;
	}

	.btn-edit:hover { background-color: var(--color-bg-elevated); border-color: var(--color-accent); color: var(--color-accent); }
	.btn-delete:hover, .btn-delete-confirm:hover { background-color: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444; }
	.btn-save { background-color: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.3); color: #22c55e; }
	.btn-save:hover { background-color: rgba(34, 197, 94, 0.2); border-color: #22c55e; }
	.btn-cancel:hover { background-color: var(--color-bg-elevated); }
	.btn-delete-confirm { background-color: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #fca5a5; }

	.delete-confirm {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.25rem 0;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.btn-add {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1rem;
		padding: 0.625rem 1.25rem;
		background-color: transparent;
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		cursor: pointer;
		width: 100%;
		justify-content: center;
		transition: all 200ms;
	}

	.btn-add:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
		background-color: rgba(232, 197, 71, 0.06);
	}

	.add-icon { font-size: 1.125rem; }
	button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
