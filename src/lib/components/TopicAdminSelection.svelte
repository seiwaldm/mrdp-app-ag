<script lang="ts">
	import type { Themengebiet } from '$lib/types';
	import Modal from './Modal.svelte';

	let {
		availableTopics,
		drawnTopic1Id = null,
		drawnTopic2Id = null,
		selectedTopicId = null,
		onDraw,
		onSelect,
		onDrawRequest
	}: {
		availableTopics: Themengebiet[];
		drawnTopic1Id?: string | number | null;
		drawnTopic2Id?: string | number | null;
		selectedTopicId?: string | number | null;
		onDraw: (t1: any, t2: any) => void;
		onSelect: (id: string | number | null) => void;
		onDrawRequest?: () => void;
	} = $props();

	let isResetModalOpen = $state(false);

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

	function confirmReset() {
		onDraw(null, null);
		isResetModalOpen = false;
	}

	let selectedTopic1 = $derived(availableTopics.find((t) => String(t.id) === String(drawnTopic1Id)));
	let selectedTopic2 = $derived(availableTopics.find((t) => String(t.id) === String(drawnTopic2Id)));

	let selectionOptions = $derived([selectedTopic1, selectedTopic2].filter(Boolean) as Themengebiet[]);
</script>

<div class="topic-admin-selection">
	<div class="header-with-action">
		<h3 class="section-title">THEMENZIEHUNG (ADMIN)</h3>
		<div class="actions">
			{#if onDrawRequest}
				<button 
					type="button" 
					class="btn-random" 
					onclick={onDrawRequest}
					title="Zufällig ziehen"
				>
					🎲
				</button>
			{/if}
			<button 
				type="button" 
				class="btn-reset" 
				onclick={() => isResetModalOpen = true}
			>
				Themenziehung zurücksetzen
			</button>
		</div>
	</div>

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

	<Modal 
		isOpen={isResetModalOpen} 
		onClose={() => isResetModalOpen = false}
		title="Themenziehung zurücksetzen?"
	>
		<p>Möchten Sie die Themengebiete wirklich erneut ziehen? Die aktuelle Auswahl wird gelöscht.</p>
		
		{#snippet footer()}
			<button class="btn-ghost" onclick={() => isResetModalOpen = false}>Abbrechen</button>
			<button class="btn-danger" onclick={confirmReset}>Ja, zurücksetzen</button>
		{/snippet}
	</Modal>
</div>

<style>
	.topic-admin-selection {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 1.5rem;
	}

	.header-with-action {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.25rem;
		gap: 0.5rem;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-title {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0;
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

	.admin-select option {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-primary);
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
        .header-with-action {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
        }

        .actions {
            width: 100%;
        }

        .btn-reset {
            width: 100%;
            text-align: center;
        }

        .selection-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .full-width {
            grid-column: span 1;
        }

        .topic-admin-selection {
            padding: 1rem;
        }
    }

	.btn-reset {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-state-exam);
		background-color: transparent;
		border: 1px solid var(--color-state-exam);
		padding: 0.4rem 0.75rem;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all 150ms ease;
	}

	.btn-reset:hover {
		background-color: var(--color-state-exam);
		color: #fff;
	}

	.btn-ghost {
		background: none;
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		padding: 0.5rem 1rem;
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		cursor: pointer;
		font-weight: 500;
	}

	.btn-ghost:hover {
		background-color: var(--color-bg-elevated);
	}

	.btn-danger {
		background-color: var(--color-state-exam);
		color: #fff;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		cursor: pointer;
		font-weight: 600;
	}

	.btn-danger:hover {
		opacity: 0.9;
	}

	.btn-random {
		padding: 0.4rem 0.6rem;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 150ms ease;
	}

	.btn-random:hover {
		background-color: var(--color-border);
		transform: scale(1.05);
	}
</style>
