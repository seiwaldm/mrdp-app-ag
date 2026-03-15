<script lang="ts">
	import type { Kommissionsmitglied } from '../types';
	
	let {
		label,
		members,
		selectedId,
		onChange
	}: {
		label: string;
		members: Kommissionsmitglied[];
		selectedId: string | number | null;
		onChange: (id: string | number | null) => void;
	} = $props();
	
	function handleChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		onChange(select.value || null);
	}
</script>

<div class="commission-panel">
	<span class="label">{label}:</span>
	<select class="member-select" value={selectedId || ''} onchange={handleChange}>
		<option value="">-- Nicht zugewiesen --</option>
		{#each members as member}
			<option value={member.id}>{member.nachname} {member.vorname}</option>
		{/each}
	</select>
</div>

<style>
	.commission-panel {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 0.75rem;
	}
	
	.label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}
	
	.member-select {
		padding: 0.5rem;
		background-color: var(--color-bg-elevated);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		cursor: pointer;
		outline: none;
		transition: border-color 150ms;
	}
	
	.member-select:focus {
		border-color: var(--color-accent);
	}
</style>
