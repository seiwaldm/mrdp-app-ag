<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import CandidateRow from '$lib/components/CandidateRow.svelte';
	import { store } from '$lib/store.svelte';
	
	// Local state for the selected date to ensure reactivity
	let localSelectedDate = $state<string | null>(null);

	// Sync local state with store on init
	$effect(() => {
		if (store.selectedDate && !localSelectedDate) {
			localSelectedDate = store.selectedDate;
		}
	});

	// Keep store in sync with local state
	$effect(() => {
		store.selectedDate = localSelectedDate;
	});

	// Extract unique available dates from the store
	let availableDates = $derived(
		[...new Set(store.antritte.map(a => a.startVB?.split('T')[0]))]
			.filter(Boolean)
			.sort() as string[]
	);

	// Filter and enrich data for each antritt based on the global store
	let filteredAntritte = $derived(
		store.antritte
			.filter(a => !localSelectedDate || (a.startVB && a.startVB.startsWith(localSelectedDate)))
			.map((antritt) => ({
				antritt,
				kandidat: store.getKandidat(antritt.kandidatId)!,
				fach: store.getFach(antritt.fachId)!,
				pruefer: antritt.prueferId ? store.getKommissionsmitglied(antritt.prueferId) : undefined,
				beisitz: antritt.beisitzId ? store.getKommissionsmitglied(antritt.beisitzId) : undefined,
				kv: antritt.kvId ? store.getKommissionsmitglied(antritt.kvId) : undefined,
				themengebiet: antritt.themenwahl 
					? (() => {
						const t = store.themengebiete.find(t => String(t.id) === String(antritt.themenwahl));
						return t ? `${t.nr}. ${t.bezeichnung}` : null;
					})()
					: null
			}))
			.sort((a, b) => {
				const timeA = a.antritt.startVB || '9999-99-99T99:99';
				const timeB = b.antritt.startVB || '9999-99-99T99:99';
				return timeA.localeCompare(timeB);
			})
	);
</script>

<div class="page-container">
	<AppHeader 
		availableDates={availableDates}
		bind:selectedDate={localSelectedDate}
		subtitle="{filteredAntritte.length} Kandidat/innen"
	/>
	
	<main class="main-content">
		<div class="table-container">
			<table class="candidates-table">
				<thead>
					<tr class="header-group-row">
						<th rowspan="2" class="col-nr">Nr.</th>
						<th rowspan="2" class="col-status"></th>
						<th rowspan="2" class="col-name">Name</th>
						<th rowspan="2" class="col-fach">Fach</th>
						<th rowspan="2" class="col-topic">Themengebiet</th>
						<th colspan="3" class="col-group-header">Kommission</th>
						<th colspan="3" class="col-group-header">Ablauf</th>
					</tr>
					<tr class="header-sub-row">
						<th class="col-person group-start">KV/Stv.</th>
						<th class="col-person">Prüfer/in</th>
						<th class="col-person group-end">Beisitz</th>
						<th class="col-time group-start">StartVB</th>
						<th class="col-time">Beginn</th>
						<th class="col-time group-end">Ende</th>
					</tr>
				</thead>
				{#key localSelectedDate}
					<tbody>
						{#each filteredAntritte as item, i (item.antritt.id)}
							<CandidateRow 
								antritt={item.antritt}
								kandidat={item.kandidat}
								fach={item.fach}
								pruefer={item.pruefer}
								beisitz={item.beisitz}
								kv={item.kv}
								themengebiet={item.themengebiet}
								displayNumber={i + 1}
							/>
						{/each}
					</tbody>
				{/key}
			</table>
		</div>
	</main>
</div>

<style>
	.page-container {
		min-height: 100vh;
		background-color: var(--color-bg-base);
	}
	
	.main-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}
	
	.table-container {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}
	
	.candidates-table {
		width: 100%;
		border-collapse: collapse;
	}
	
	thead {
		background-color: var(--color-bg-elevated);
		border-bottom: 1px solid var(--color-border);
	}
	
	th {
		padding: 0.75rem 1rem;
		text-align: left;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}
	
	th.col-nr {
		text-align: right;
	}
	
	th.col-time {
		text-align: right;
	}

	.col-topic {
		width: 15rem;
		font-style: italic;
	}

	.col-group-header {
		text-align: center;
		border-bottom: 1px solid var(--color-border);
		padding: 0.5rem 1rem;
		font-size: 0.65rem;
		letter-spacing: 0.15em;
		color: var(--color-accent);
	}

	.group-start {
		padding-left: 2rem !important;
	}

	.group-end {
		padding-right: 2rem !important;
	}
	
	@media (max-width: 640px) {
		.main-content {
			padding: 1rem;
		}
		
		.table-container {
			background-color: transparent;
			border: none;
			overflow: visible;
		}
		
		.candidates-table {
			display: block;
		}

		.candidates-table thead {
			display: none;
		}
		
		.candidates-table tbody {
			display: block;
			padding: 0;
		}
	}
</style>
