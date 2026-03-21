<script lang="ts">
	let {
		label,
		value,
		readonly = false,
		onChange
	}: {
		label: string;
		value: string | null;
		readonly?: boolean;
		onChange: (time: string) => void;
	} = $props();
	
	// Parse the value (ISO) into date and time parts
	let datePart = $derived(value ? value.split('T')[0] : '');
	let timePart = $derived(value && value.includes('T') ? value.split('T')[1].substring(0, 5) : '');
	
	function setCurrentTime() {
		const now = new Date();
		const pad = (n: number) => String(n).padStart(2, '0');
		const y = now.getFullYear();
		const m = pad(now.getMonth() + 1);
		const d = pad(now.getDate());
		const h = pad(now.getHours());
		const min = pad(now.getMinutes());
		
		const dateTimeString = `${y}-${m}-${d}T${h}:${min}`;
		onChange(dateTimeString);
	}
	
	function handleDateChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const newDate = input.value;
		if (!newDate) return;
		
		const time = timePart || '00:00';
		onChange(`${newDate}T${time}`);
	}

	function handleTimeChange(event: Event) {
		const input = event.target as HTMLInputElement;
		let newTime = input.value;
		
		// Basic validation/formatting for HH:mm
		if (newTime.length === 2 && !newTime.includes(':')) {
			newTime += ':';
		}
		
		if (newTime.length === 5) {
			const [h, m] = newTime.split(':').map(Number);
			if (h >= 0 && h < 24 && m >= 0 && m < 60) {
				const date = datePart || new Date().toISOString().split('T')[0];
				onChange(`${date}T${newTime}`);
			}
		}
	}
</script>

<div class="time-slot" class:readonly>
	<span class="time-label">{label}</span>
	<div class="time-controls">
		{#if readonly}
			<div class="time-display font-mono">
				{#if datePart || timePart}
					<span class="date-val">{datePart}</span>
					<span class="time-val">{timePart}</span>
				{:else}
					<span class="empty-val">—</span>
				{/if}
			</div>
		{:else}
			<button type="button" class="btn-now" onclick={setCurrentTime} title="Jetzt setzen">
				⏱
			</button>
			<div class="input-group">
				<input 
					type="date" 
					class="date-input font-mono" 
					value={datePart} 
					oninput={handleDateChange}
					class:filled={datePart}
				/>
				<input 
					type="text" 
					class="time-input-forced font-mono" 
					value={timePart} 
					oninput={handleTimeChange}
					placeholder="HH:mm"
					maxlength="5"
					class:filled={timePart}
				/>
			</div>
		{/if}
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

	.input-group {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 0.25rem;
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
	
	.date-input, .time-input-forced {
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		padding: 0.25rem;
	}

	.date-input {
		width: 8rem;
		border-right: 1px solid var(--color-border);
	}

	.time-input-forced {
		width: 4rem;
		text-align: center;
	}
	
	.date-input.filled, .time-input-forced.filled {
		color: var(--color-accent);
	}
	
	input:focus {
		outline: none;
	}

	.input-group:focus-within {
		border-color: var(--color-accent);
	}

	.time-display {
		display: flex;
		gap: 0.75rem;
		font-size: 0.875rem;
		color: var(--color-accent);
		padding: 0.25rem 0.5rem;
	}

	.date-val {
		border-right: 1px solid var(--color-border);
		padding-right: 0.75rem;
	}

	.empty-val {
		color: var(--color-text-muted);
	}
</style>
