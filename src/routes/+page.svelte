<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import CandidateRow from '$lib/components/CandidateRow.svelte';
	import { store } from '$lib/store.svelte';
	
	// Prepare enriched data for each antritt based on the global store
	let enrichedAntritte = $derived(
		store.antritte.map((antritt) => ({
			antritt,
			kandidat: store.getKandidat(antritt.kandidatId)!,
			fach: store.getFach(antritt.fachId)!,
			pruefer: store.getKommissionsmitglied(antritt.prueferId!)!,
			beisitz: store.getKommissionsmitglied(antritt.beisitzId!)!,
			kv: store.getKommissionsmitglied(antritt.kvId!)!
		}))
	);
	
	const examDate = 'Dienstag, 15. Juni 2026';
</script>

<div class="page-container">
	<AppHeader 
		subtitle="Prüfungstag: {examDate} • {store.antritte.length} Kandidat/innen"
	/>
	
	<main class="main-content">
		<div class="table-container">
			<table class="candidates-table">
				<thead>
					<tr>
						<th class="col-nr">Nr.</th>
						<th class="col-status"></th>
						<th class="col-name">Name</th>
						<th class="col-fach">Fach</th>
						<th class="col-person">KV/Stv.</th>
						<th class="col-person">Prüfer/in</th>
						<th class="col-person">Beisitz</th>
						<th class="col-time">Beginn</th>
						<th class="col-time">Ende</th>
					</tr>
				</thead>
				<tbody>
					{#each enrichedAntritte as item, i (item.antritt.id)}
						<CandidateRow 
							antritt={item.antritt}
							kandidat={item.kandidat}
							fach={item.fach}
							pruefer={item.pruefer}
							beisitz={item.beisitz}
							kv={item.kv}
						/>
					{/each}
				</tbody>
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
	
	@media (max-width: 640px) {
		.main-content {
			padding: 1rem;
		}
		
		.table-container {
			background-color: transparent;
			border: none;
		}
		
		.candidates-table thead {
			display: none;
		}
		
		.candidates-table tbody {
			display: block;
		}
	}
</style>
