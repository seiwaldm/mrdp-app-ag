<script lang="ts">
	import type { Themengebiet } from '$lib/types';

	let {
		availableTopics,
		drawnTopic1Id = null,
		drawnTopic2Id = null,
		selectedTopicId = null,
		onDraw,
		onSelect
	}: {
		availableTopics: Themengebiet[];
		drawnTopic1Id?: string | number | null;
		drawnTopic2Id?: string | number | null;
		selectedTopicId?: string | number | null;
		onDraw: (t1: any, t2: any) => void;
		onSelect: (id: string | number | null) => void;
	} = $props();

	function handleTopic1Change(e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		const t1 = availableTopics.find((t) => String(t.id) === val) || null;
		const t2 = availableTopics.find((t) => String(t.id) === String(drawnTopic2Id)) || null;
		onDraw(t1, t2);
	}

	function handleTopic2Change(e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		const t1 = availableTopics.find((t) => String(t.id) === String(drawnTopic1Id)) || null;
		const t2 = availableTopics.find((t) => String(t.id) === val) || null;
		onDraw(t1, t2);
	}

	function handleSelectionChange(e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		onSelect(val || null);
	}

	let selectedTopic1 = $derived(availableTopics.find((t) => String(t.id) === String(drawnTopic1Id)));
	let selectedTopic2 = $derived(availableTopics.find((t) => String(t.id) === String(drawnTopic2Id)));

	let selectionOptions = $derived([selectedTopic1, selectedTopic2].filter(Boolean) as Themengebiet[]);
</script>

<div class="topic-admin-selection">
	<h3 class="section-title">THEMENZIEHUNG (ADMIN)</h3>

	<div class="selection-grid">
		<div class="selection-field">
			<label for="topic1" class="field-label">Themengebiet 1:</label>
			<select id="topic1" class="admin-select" value={drawnTopic1Id || ''} onchange={handleTopic1Change}>
				<option value="">— Bitte wählen —</option>
				{#each availableTopics as topic}
					<option value={topic.id} disabled={String(topic.id) === String(drawnTopic2Id)}>
						{topic.nr}. {topic.bezeichnung}
					</option>
				{/each}
			</select>
		</div>

		<div class="selection-field">
			<label for="topic2" class="field-label">Themengebiet 2:</label>
			<select id="topic2" class="admin-select" value={drawnTopic2Id || ''} onchange={handleTopic2Change}>
				<option value="">— Bitte wählen —</option>
				{#each availableTopics as topic}
					<option value={topic.id} disabled={String(topic.id) === String(drawnTopic1Id)}>
						{topic.nr}. {topic.bezeichnung}
					</option>
				{/each}
			</select>
		</div>

		<div class="selection-field full-width">
			<label for="themenwahl" class="field-label">Gewähltes Themengebiet:</label>
			<select
				id="themenwahl"
				class="admin-select highlight"
				value={selectedTopicId || ''}
				onchange={handleSelectionChange}
				disabled={!drawnTopic1Id || !drawnTopic2Id}
			>
				<option value="">— Bitte wählen —</option>
				{#each selectionOptions as topic}
					<option value={topic.id}>
						{topic.nr}. {topic.bezeichnung}
					</option>
				{/each}
			</select>
		</div>
	</div>
</div>

<style>
	.topic-admin-selection {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 1.5rem;
	}

	.section-title {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0 0 1.25rem 0;
	}

	.selection-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
	}

	.selection-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.full-width {
		grid-column: span 2;
		margin-top: 0.5rem;
	}

	.field-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.admin-select {
		width: 100%;
		padding: 0.75rem;
		background-color: var(--color-bg-elevated);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 0.9375rem;
		font-family: var(--font-sans);
		transition: all 150ms ease;
		cursor: pointer;
	}

	.admin-select:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), 0.1);
	}

	.admin-select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: var(--color-bg-base);
	}

	.admin-select.highlight {
		border-color: var(--color-accent);
		font-weight: 500;
		background-color: rgba(var(--color-accent-rgb), 0.03);
	}
    
    @media (max-width: 640px) {
        .selection-grid {
            grid-template-columns: 1fr;
        }
        .full-width {
            grid-column: span 1;
        }
    }
</style>
