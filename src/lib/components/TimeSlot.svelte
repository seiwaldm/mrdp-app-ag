<script lang="ts">
	let {
		label,
		value,
		onChange
	}: {
		label: string;
		value: string | null;
		onChange: (time: string) => void;
	} = $props();
	
	function setCurrentTime() {
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const timeString = `${hours}:${minutes}`;
		onChange(timeString);
	}
	
	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		onChange(input.value);
	}
</script>

<div class="time-slot">
	<span class="time-label">{label}</span>
	<div class="time-controls">
		<button type="button" class="btn-now" onclick={setCurrentTime} title="Aktuelle Zeit setzen">
			⏱
		</button>
		<input 
			type="time" 
			class="time-input font-mono" 
			value={value || ''} 
			oninput={handleInput}
			class:filled={value}
		/>
	</div>
</div>

<style>
	.time-slot {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0;
	}
	
	.time-label {
		flex: 0 0 auto;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		min-width: 5rem;
	}
	
	.time-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
	}
	
	.btn-now {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background-color: var(--color-accent-dim);
		color: var(--color-accent);
		border: none;
		border-radius: var(--radius-sm);
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 150ms;
	}
	
	.btn-now:hover {
		background-color: var(--color-accent);
		color: var(--color-bg-base);
	}
	
	.time-input {
		flex: 0 0 auto;
		width: 6rem;
		padding: 0.5rem;
		background-color: var(--color-bg-elevated);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		transition: all 150ms;
	}
	
	.time-input.filled {
		color: var(--color-accent);
		border-color: var(--color-accent-dim);
	}
	
	.time-input:focus {
		outline: none;
		border-color: var(--color-accent);
	}
</style>
