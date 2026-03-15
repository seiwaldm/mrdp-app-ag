<script lang="ts">
	let {
		value,
		onChange
	}: {
		value: number | null;
		onChange: (grade: number) => void;
	} = $props();
	
	const grades = [1, 2, 3, 4, 5];
</script>

<div class="grade-selector">
	{#each grades as grade}
		<button
			type="button"
			class="grade-btn"
			class:selected={value === grade}
			onclick={() => onChange(grade)}
		>
			{grade}
		</button>
	{/each}
</div>

<style>
	.grade-selector {
		display: flex;
		gap: 0.5rem;
	}
	
	.grade-btn {
		flex: 1;
		min-width: 2.5rem;
		padding: 0.75rem 1rem;
		background-color: var(--color-bg-elevated);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 150ms;
	}
	
	.grade-btn:hover {
		background-color: var(--color-bg-surface);
		border-color: var(--color-text-muted);
	}
	
	.grade-btn.selected {
		background-color: var(--color-accent);
		color: var(--color-bg-base);
		border-color: var(--color-accent);
	}
	
	.grade-btn.selected:hover {
		background-color: var(--color-accent);
		opacity: 0.9;
	}
</style>
