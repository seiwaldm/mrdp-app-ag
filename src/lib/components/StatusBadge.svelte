<script lang="ts">
	let { status }: { status: 'waiting' | 'prep' | 'exam' | 'done' } = $props();
	
	const statusConfig = {
		waiting: { color: 'var(--color-state-waiting)', label: 'Wartet' },
		prep: { color: 'var(--color-state-prep)', label: 'Vorbereitung' },
		exam: { color: 'var(--color-state-exam)', label: 'Prüfung' },
		done: { color: 'var(--color-state-done)', label: 'Abgeschlossen' }
	};
	
	const config = statusConfig[status];
</script>

<div class="status-badge" style="--status-color: {config.color}">
	<div class="status-dot"></div>
	<span class="sr-only">{config.label}</span>
</div>

<style>
	.status-badge {
		position: relative;
		width: 8px;
		height: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: var(--status-color);
	}
	
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
