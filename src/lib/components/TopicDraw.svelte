<script lang="ts">
	import TopicCard from './TopicCard.svelte';
	
	let {
		availableTopics,
		drawnTopic1 = null,
		drawnTopic2 = null,
		selectedTopicId = null,
		onDraw,
		onSelect,
		onDrawRequest
	}: {
		availableTopics: Array<{ id: string | number; bezeichnung: string; nr?: number }>;
		drawnTopic1?: { id: string | number; bezeichnung: string; nr?: number } | null;
		drawnTopic2?: { id: string | number; bezeichnung: string; nr?: number } | null;
		selectedTopicId?: string | number | null;
		onDraw: (topic1: any, topic2: any) => void;
		onSelect: (topicId: string | number) => void;
		onDrawRequest?: () => Promise<void>;
	} = $props();
	
	let isDrawing = $state(false);
	let hasDrawn = $derived(!!drawnTopic1 && !!drawnTopic2);
	let canSelect = $derived(hasDrawn && selectedTopicId === null);
	
	async function drawTopics() {
		if (availableTopics.length < 2) {
			alert('Nicht genügend Themengebiete verfügbar');
			return;
		}

		if (onDrawRequest) {
			isDrawing = true;
			try {
				await onDrawRequest();
			} finally {
				isDrawing = false;
			}
			return;
		}
		
		// Fallback for local shuffle (e.g. in tests)
		const shuffled = [...availableTopics];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		
		onDraw(shuffled[0], shuffled[1]);
	}
	
	function selectTopic(topicId: string | number) {
		onSelect(topicId);
	}
	
	function confirmReset() {
		if (confirm('Möchten Sie die Themengebiete wirklich erneut ziehen? Die aktuelle Auswahl wird gelöscht.')) {
			onDraw(null, null);
		}
	}
</script>

<div class="topic-draw">
	<h3 class="section-title">THEMENZIEHUNG</h3>
	
	{#if !hasDrawn}
		<button 
			type="button" 
			class="btn-draw" 
			class:loading={isDrawing}
			onclick={drawTopics} 
			disabled={isDrawing}
		>
			{#if isDrawing}
				<span class="spinner"></span> Ziehe Themen...
			{:else}
				🎲 Zwei Themengebiete ziehen
			{/if}
		</button>
	{:else}
		<div class="drawn-topics">
			<div class="topic-row">
				<span class="topic-label">Themengebiet 1:</span>
				{#if drawnTopic1}
					<TopicCard 
						topic={drawnTopic1} 
						selected={selectedTopicId === drawnTopic1.id}
						selectable={canSelect}
						onSelect={() => selectTopic(drawnTopic1.id)}
					/>
				{/if}
			</div>
			
			<div class="topic-row">
				<span class="topic-label">Themengebiet 2:</span>
				{#if drawnTopic2}
					<TopicCard 
						topic={drawnTopic2} 
						selected={selectedTopicId === drawnTopic2.id}
						selectable={canSelect}
						onSelect={() => selectTopic(drawnTopic2.id)}
					/>
				{/if}
			</div>
			
			{#if selectedTopicId}
				<div class="selected-info">
					✓ Gewähltes Themengebiet: <strong>
						{selectedTopicId === drawnTopic1?.id 
							? (drawnTopic1.nr !== undefined ? `${drawnTopic1.nr}. ` : '') + drawnTopic1.bezeichnung 
							: (drawnTopic2?.nr !== undefined ? `${drawnTopic2?.nr}. ` : '') + drawnTopic2?.bezeichnung}
					</strong>
				</div>
			{:else}
				<div class="selection-prompt">
					Bitte wählen Sie ein Themengebiet für die Prüfung
				</div>
			{/if}
			
			<button type="button" class="btn-redraw" onclick={confirmReset}>
				Erneut ziehen
			</button>
		</div>
	{/if}
</div>

<style>
	.topic-draw {
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
		margin: 0 0 1rem 0;
	}
	
	.btn-draw {
		width: 100%;
		padding: 1rem 1.5rem;
		background-color: var(--color-accent);
		color: #fff;
		border: none;
		border-radius: var(--radius-sm);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 150ms;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}
	
	.btn-draw:hover:not(:disabled) {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.btn-draw:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.drawn-topics {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.topic-row {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.topic-label {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}
	
	.selected-info {
		padding: 0.75rem;
		background-color: rgba(34, 197, 94, 0.1);
		border: 1px solid var(--color-state-done);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: 0.875rem;
	}
	
	.selection-prompt {
		padding: 0.75rem;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		text-align: center;
	}
	
	.btn-redraw {
		padding: 0.5rem 1rem;
		background-color: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 150ms;
	}
	
	.btn-redraw:hover {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-secondary);
	}
</style>
