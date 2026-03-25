<script lang="ts">
	import { supabase } from '$lib/supabase';

	export type ColumnDef = {
		key: string;
		label: string;
		type: 'text' | 'number' | 'select' | 'multiselect';
		required?: boolean;
		options?: { value: number | string; label: string }[];
		dbKey?: string; // snake_case key for Supabase, if different from key
	};

	let {
		tableName,
		columns,
		data = $bindable([]),
		onRefresh
	}: {
		tableName: string;
		columns: ColumnDef[];
		data: any[];
		onRefresh: () => Promise<void>;
	} = $props();

	let editingId = $state<number | string | null>(null);
	let editValues = $state<Record<string, any>>({});
	let addingNew = $state(false);
	let newValues = $state<Record<string, any>>({});
	let deletingId = $state<number | string | null>(null);
	let saving = $state(false);
	let error = $state<string | null>(null);

	function getDbKey(col: ColumnDef): string {
		return col.dbKey || col.key;
	}

	function startEdit(row: any) {
		editingId = row.id;
		editValues = {};
		for (const col of columns) {
			editValues[col.key] = row[col.key];
		}
	}

	function cancelEdit() {
		editingId = null;
		editValues = {};
	}

	async function saveEdit(id: number | string) {
		saving = true;
		error = null;
		try {
			const updates: Record<string, any> = {};
			for (const col of columns) {
				updates[getDbKey(col)] = editValues[col.key];
			}
			const { error: dbError } = await supabase.from(tableName).update(updates).eq('id', id);
			if (dbError) throw dbError;
			editingId = null;
			editValues = {};
			await onRefresh();
		} catch (e: any) {
			error = e.message || 'Fehler beim Speichern';
		} finally {
			saving = false;
		}
	}

	function startAdd() {
		addingNew = true;
		newValues = {};
		for (const col of columns) {
			newValues[col.key] = col.type === 'multiselect' ? [] : '';
		}
	}

	function cancelAdd() {
		addingNew = false;
		newValues = {};
	}

	async function saveNew() {
		saving = true;
		error = null;
		try {
			const insert: Record<string, any> = {};
			for (const col of columns) {
				const val = newValues[col.key];
				if (col.required && (val === '' || val === null || val === undefined)) {
					throw new Error(`${col.label} ist erforderlich`);
				}
				insert[getDbKey(col)] = val === '' ? null : val;
			}
			const { error: dbError } = await supabase.from(tableName).insert(insert);
			if (dbError) throw dbError;
			addingNew = false;
			newValues = {};
			await onRefresh();
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
			const { error: dbError } = await supabase.from(tableName).delete().eq('id', id);
			if (dbError) throw dbError;
			deletingId = null;
			await onRefresh();
		} catch (e: any) {
			error = e.message || 'Fehler beim Löschen';
		} finally {
			saving = false;
		}
	}

	function getDisplayValue(row: any, col: ColumnDef): string {
		const val = row[col.key];
		if (val === null || val === undefined) return '—';
		if (col.type === 'select' && col.options) {
			const opt = col.options.find(o => String(o.value) === String(val));
			return opt ? opt.label : String(val);
		}
		if (col.type === 'multiselect' && col.options && Array.isArray(val)) {
			return val
				.map(v => col.options!.find(o => String(o.value) === String(v))?.label || String(v))
				.join(', ') || '—';
		}
		return String(val);
	}

	function handleMultiselectChange(key: string, value: string, checked: boolean, target: 'edit' | 'new') {
		const store = target === 'edit' ? editValues : newValues;
		const current = Array.isArray(store[key]) ? [...store[key]] : [];
		const numVal = Number(value);
		if (checked) {
			current.push(numVal);
		} else {
			const idx = current.indexOf(numVal);
			if (idx > -1) current.splice(idx, 1);
		}
		if (target === 'edit') {
			editValues[key] = current;
			editValues = { ...editValues };
		} else {
			newValues[key] = current;
			newValues = { ...newValues };
		}
	}
</script>

{#if error}
	<div class="admin-error">
		<span>{error}</span>
		<button type="button" onclick={() => error = null}>✕</button>
	</div>
{/if}

<div class="admin-table-wrapper">
	<table class="admin-table">
		<thead>
			<tr>
				<th class="col-id">ID</th>
				{#each columns as col}
					<th>{col.label}</th>
				{/each}
				<th class="col-actions">Aktionen</th>
			</tr>
		</thead>
		<tbody>
			{#each data as row (row.id)}
				{#if editingId === row.id}
					<tr class="editing-row">
						<td class="col-id">{row.id}</td>
						{#each columns as col}
							<td>
								{#if col.type === 'select' && col.options}
									<select
										class="edit-input"
										value={editValues[col.key] ?? ''}
										onchange={(e) => { editValues[col.key] = e.currentTarget.value ? Number(e.currentTarget.value) : null; editValues = {...editValues}; }}
									>
										<option value="">— Keine Auswahl —</option>
										{#each col.options as opt}
											<option value={opt.value}>{opt.label}</option>
										{/each}
									</select>
								{:else if col.type === 'multiselect' && col.options}
									<div class="multiselect-group">
										{#each col.options as opt}
											<label class="multiselect-option">
												<input
													type="checkbox"
													checked={Array.isArray(editValues[col.key]) && editValues[col.key].includes(Number(opt.value))}
													onchange={(e) => handleMultiselectChange(col.key, String(opt.value), e.currentTarget.checked, 'edit')}
												/>
												<span>{opt.label}</span>
											</label>
										{/each}
									</div>
								{:else}
									<input
										type={col.type === 'number' ? 'number' : 'text'}
										class="edit-input"
										value={editValues[col.key] ?? ''}
										oninput={(e) => { editValues[col.key] = e.currentTarget.value; editValues = {...editValues}; }}
									/>
								{/if}
							</td>
						{/each}
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
						<td colspan={columns.length + 2}>
							<div class="delete-confirm">
								<span>Eintrag #{row.id} wirklich löschen?</span>
								<button type="button" class="btn-delete-confirm" onclick={() => confirmDelete(row.id)} disabled={saving}>
									{saving ? '…' : 'Ja, löschen'}
								</button>
								<button type="button" class="btn-cancel" onclick={() => deletingId = null} disabled={saving}>Abbrechen</button>
							</div>
						</td>
					</tr>
				{:else}
					<tr>
						<td class="col-id">{row.id}</td>
						{#each columns as col}
							<td>{getDisplayValue(row, col)}</td>
						{/each}
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
					<td class="col-id">—</td>
					{#each columns as col}
						<td>
							{#if col.type === 'select' && col.options}
								<select
									class="edit-input"
									value={newValues[col.key] ?? ''}
									onchange={(e) => { newValues[col.key] = e.currentTarget.value ? Number(e.currentTarget.value) : null; newValues = {...newValues}; }}
								>
									<option value="">— Keine Auswahl —</option>
									{#each col.options as opt}
										<option value={opt.value}>{opt.label}</option>
									{/each}
								</select>
							{:else if col.type === 'multiselect' && col.options}
								<div class="multiselect-group">
									{#each col.options as opt}
										<label class="multiselect-option">
											<input
												type="checkbox"
												checked={Array.isArray(newValues[col.key]) && newValues[col.key].includes(Number(opt.value))}
												onchange={(e) => handleMultiselectChange(col.key, String(opt.value), e.currentTarget.checked, 'new')}
											/>
											<span>{opt.label}</span>
										</label>
									{/each}
								</div>
							{:else}
								<input
									type={col.type === 'number' ? 'number' : 'text'}
									class="edit-input"
									value={newValues[col.key] ?? ''}
									oninput={(e) => { newValues[col.key] = e.currentTarget.value; newValues = {...newValues}; }}
									placeholder={col.label}
								/>
							{/if}
						</td>
					{/each}
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
		<span class="add-icon">＋</span> Neuen Eintrag hinzufügen
	</button>
{/if}

<style>
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
		transition: opacity 150ms;
	}

	.admin-error button:hover {
		opacity: 1;
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
		padding: 0.75rem 1rem;
		text-align: left;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	td {
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
		color: var(--color-text-primary);
		border-bottom: 1px solid var(--color-border);
		vertical-align: middle;
	}

	.col-id {
		width: 4rem;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
	}

	.col-actions {
		width: 6rem;
		text-align: right;
	}

	tr:hover:not(.editing-row):not(.adding-row):not(.deleting-row) {
		background-color: var(--color-bg-elevated);
	}

	.editing-row, .adding-row {
		background-color: rgba(232, 197, 71, 0.06);
	}

	.deleting-row {
		background-color: rgba(239, 68, 68, 0.06);
	}

	/* Input styles */
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

	.edit-input:focus {
		border-color: var(--color-accent);
	}

	select.edit-input {
		cursor: pointer;
	}

	/* Multiselect */
	.multiselect-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.multiselect-option {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		background-color: var(--color-bg-base);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 150ms;
	}

	.multiselect-option:hover {
		border-color: var(--color-accent);
	}

	.multiselect-option input[type="checkbox"] {
		accent-color: var(--color-accent);
	}

	/* Action buttons */
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

	.btn-edit:hover {
		background-color: var(--color-bg-elevated);
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.btn-delete:hover, .btn-delete-confirm:hover {
		background-color: rgba(239, 68, 68, 0.1);
		border-color: #ef4444;
		color: #ef4444;
	}

	.btn-save {
		background-color: rgba(34, 197, 94, 0.1);
		border-color: rgba(34, 197, 94, 0.3);
		color: #22c55e;
	}

	.btn-save:hover {
		background-color: rgba(34, 197, 94, 0.2);
		border-color: #22c55e;
	}

	.btn-cancel:hover {
		background-color: var(--color-bg-elevated);
	}

	.btn-delete-confirm {
		background-color: rgba(239, 68, 68, 0.1);
		border-color: rgba(239, 68, 68, 0.3);
		color: #fca5a5;
	}

	/* Delete confirm */
	.delete-confirm {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.25rem 0;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	/* Add button */
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

	.add-icon {
		font-size: 1.125rem;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
