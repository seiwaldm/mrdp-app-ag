<script lang="ts">
	import StatusBadge from './StatusBadge.svelte';
	import FachChip from './FachChip.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { store } from '../store.svelte';
	import type { Antritt, Fach, Kandidat, Kommissionsmitglied } from '../types';
	
	let {
		antritt,
		kandidat,
		fach,
		pruefer,
		beisitz,
		kv,
		displayNumber,
		themengebiet
	}: {
		antritt: Antritt;
		kandidat: Kandidat;
		fach: Fach;
		pruefer: Kommissionsmitglied | undefined;
		beisitz: Kommissionsmitglied | undefined;
		kv: Kommissionsmitglied | undefined;
		displayNumber: number;
		themengebiet?: string | null;
	} = $props();

	// Helper to format person names
	function formatPerson(person: Kommissionsmitglied | undefined): string {
		if (!person) return '—';
		return `${person.nachname} ${person.vorname[0]}.`;
	}
	
	// Determine status based on time values
	let status = $derived(store.getExamState(antritt));
	
	// Format time or show dash
	function formatTime(time: string | null): string {
		return store.formatToTimeOnly(time);
	}
	
	function handleRowClick() {
		goto(`${base}/antritt/${antritt.id}`);
	}
</script>

<tr class="candidate-row status-{status}" onclick={handleRowClick}>
	<td class="col-nr font-mono">{displayNumber}</td>
	<td class="col-status">
		<StatusBadge {status} />
	</td>
	<td class="col-name">
		<span class="name-text">
			{kandidat.nachname}, {kandidat.vorname}
		</span>
	</td>
	<td class="col-fach">
		<FachChip kurzform={fach.kurzform} />
	</td>
	<td class="col-topic">{themengebiet || '—'}</td>
	<td class="col-person group-start">{formatPerson(kv)}</td>
	<td class="col-person">{formatPerson(pruefer)}</td>
	<td class="col-person group-end">{formatPerson(beisitz)}</td>
	<td class="col-time font-mono group-start" class:filled={antritt.startVB}>{formatTime(antritt.startVB)}</td>
	<td class="col-time font-mono" class:filled={antritt.beginn}>{formatTime(antritt.beginn)}</td>
	<td class="col-time font-mono group-end" class:filled={antritt.ende}>{formatTime(antritt.ende)}</td>
	{#if store.userRole === 'admin'}
		<td class="col-grade font-mono group-start">{antritt.pruefungsnote ?? '—'}</td>
		<td class="col-grade font-mono">{antritt.jahresnote ?? '—'}</td>
		<td class="col-grade font-mono group-end">
			{#if antritt.pruefungsnote && antritt.jahresnote}
				{Math.round((antritt.pruefungsnote + antritt.jahresnote) / 2)}
			{:else}
				—
			{/if}
		</td>
	{/if}
</tr>

<style>
	.candidate-row {
		border-bottom: 1px solid var(--color-border);
		transition: background-color 150ms;
		cursor: pointer;
	}
	
	.candidate-row:hover {
		background-color: var(--color-bg-elevated);
		filter: brightness(1.1);
	}
	
	/* Status border stripe */
	.candidate-row.status-waiting {
		border-left: 4px solid var(--color-state-waiting);
	}
	
	.candidate-row.status-prep {
		border-left: 4px solid var(--color-state-prep);
	}
	
	.candidate-row.status-exam {
		border-left: 4px solid var(--color-state-exam);
	}
	
	.candidate-row.status-done {
		border-left: 4px solid var(--color-state-done);
	}
	
	.candidate-row.status-waiting {
		background-color: rgba(59, 130, 246, 0.05);
	}
	
	.candidate-row.status-prep {
		background-color: rgba(239, 68, 68, 0.05);
	}
	
	.candidate-row.status-exam {
		background-color: rgba(232, 197, 71, 0.05);
	}
	
	.candidate-row.status-done {
		background-color: rgba(34, 197, 94, 0.05);
	}
	
	td {
		padding: 0.75rem 1rem;
		vertical-align: middle;
	}
	
	.col-nr {
		width: 3rem;
		text-align: right;
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}
	
	.col-status {
		width: 2rem;
		text-align: center;
	}
	
	.col-name {
		font-weight: 600;
		color: var(--color-text-primary);
	}
	
	.name-link {
		color: inherit;
		text-decoration: none;
	}
	
	.name-link:hover {
		color: var(--color-accent);
	}
	
	.col-fach {
		width: 6rem;
	}
	
	.col-person {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}
	
	.col-time {
		width: 4rem;
		text-align: right;
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.col-grade {
		width: 4rem;
		text-align: center;
		color: var(--color-text-primary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.col-topic {
		font-style: italic;
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.group-start {
		padding-left: 2rem !important;
	}

	.group-end {
		padding-right: 2rem !important;
	}
	
	.col-time.filled {
		color: var(--color-accent);
	}
	
	@media (max-width: 640px) {
		.candidate-row {
			display: block;
			margin-bottom: 1rem;
			border-left: 4px solid var(--color-border);
			border-radius: var(--radius-sm);
			background-color: var(--color-bg-surface);
		}
		
		.candidate-row:hover {
			background-color: var(--color-bg-elevated);
		}
		
		td {
			display: inline;
		}
		
		/* Hide columns not needed in mobile */
		.col-nr,
		.col-person {
			display: none;
		}
	}
</style>
