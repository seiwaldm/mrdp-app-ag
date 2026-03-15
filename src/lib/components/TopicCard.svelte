<script lang="ts">
	let {
		topic,
		selected = false,
		onSelect = null,
		selectable = false
	}: {
		topic: { id: string | number; bezeichnung: string };
		selected?: boolean;
		onSelect?: (() => void) | null;
		selectable?: boolean;
	} = $props();
</script>

<button 
	type="button"
	class="topic-card" 
	class:selected
	class:selectable
	onclick={onSelect as any}
	disabled={!selectable}
>
	{#if selected}
		<div class="check-mark">✓</div>
	{/if}
	<span class="topic-text">{topic.bezeichnung}</span>
</button>

<style>
	.topic-card {
		position: relative;
		display: block;
		width: 100%;
		padding: 0.75rem 1rem;
		background-color: var(--color-bg-elevated);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
		border-left: 3px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		text-align: left;
		transition: all 150ms;
	}
	
	.topic-card.selectable {
		cursor: pointer;
	}
	
	.topic-card.selectable:hover {
		background-color: var(--color-bg-surface);
		border-left-color: var(--color-accent);
	}
	
	.topic-card.selected {
		background-color: var(--color-bg-surface);
		border-left-color: var(--color-state-done);
		color: var(--color-text-primary);
	}
	
	.check-mark {
		position: absolute;
		top: 0.5rem;
		right: 0.75rem;
		color: var(--color-state-done);
		font-weight: bold;
		font-size: 1rem;
	}
	
	.topic-text {
		display: block;
		padding-right: 1.5rem;
	}
</style>
