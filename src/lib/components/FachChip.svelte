<script lang="ts">
	let { kurzform }: { kurzform: string } = $props();
</script>

<span class="fach-chip font-mono">
	{kurzform}
</span>

<style>
	.fach-chip {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background-color: var(--color-bg-elevated);
		color: var(--color-text-secondary);
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.05em;
	}
</style>
