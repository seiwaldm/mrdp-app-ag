<script lang="ts">
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { store } from '$lib/store.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import FachChip from '$lib/components/FachChip.svelte';
	import TimeSlot from '$lib/components/TimeSlot.svelte';
	import TopicDraw from '$lib/components/TopicDraw.svelte';
	import TopicAdminSelection from '$lib/components/TopicAdminSelection.svelte';
	import GradeSelector from '$lib/components/GradeSelector.svelte';
	import CommissionPanel from '$lib/components/CommissionPanel.svelte';

	// Get ID from URL params (in SvelteKit $page store)
	let antrittId = $derived($page.params.id as string);

	// Retrieve correct data based on ID
	let antritt = $derived(store.getAntritt(antrittId)!);
	let kandidat = $derived(antritt ? store.getKandidat(antritt.kandidatId)! : undefined);
	let fach = $derived(antritt ? store.getFach(antritt.fachId)! : undefined);

	// Helper for checking if page is valid
	let isValidTarget = $derived(!!(antritt && kandidat && fach));

	let status = $derived(antritt ? store.getExamState(antritt) : 'waiting');


	function updateTime(field: 'startVB' | 'beginn' | 'ende', timeStr: string) {
		if (antritt) {
			store.updateAntritt(antrittId, { [field]: timeStr });
		}
	}

	function handleDrawTopics(t1: any, t2: any) {
		if (antritt) {
			store.updateAntritt(antrittId, {
				thema1Id: t1?.id || null,
				thema2Id: t2?.id || null,
				themenwahl: null,
				aufgabeNr: null
			});
		}
	}

	function handleSelectTopic(topicId: string | number | null) {
		if (antritt) {
			store.updateAntritt(antrittId, { 
				themenwahl: topicId,
				aufgabeNr: null
			});
		}
	}

	function handleGradeChange(grade: number) {
		if (antritt) {
			store.updateAntritt(antrittId, { pruefungsnote: grade as 1|2|3|4|5 });
		}
	}

	// handleYearGradeChange removed since Jahresnote is now read-only

	function updateCommission(role: 'kvId' | 'prueferId' | 'beisitzId', memberId: string | number | null) {
		if (antritt) {
			store.updateAntritt(antrittId, { [role]: memberId });
		}
	}
	
	function handleAufgabenNr(event: Event) {
		if (antritt) {
			const select = event.target as HTMLSelectElement;
			const val = parseInt(select.value);
			store.updateAntritt(antrittId, { aufgabeNr: isNaN(val) ? null : val });
		}
	}

	async function handleDrawRequest() {
		if (antritt) {
			await store.drawTopics(antrittId);
		}
	}
</script>

<div class="page-container">
	{#if store.error}
		<div class="error-toast" transition:fade>
			<span class="error-icon">⚠️</span>
			<span class="error-message">{store.error}</span>
			<button class="close-error" onclick={() => store.error = null}>&times;</button>
		</div>
	{/if}

	{#if isValidTarget}
		<AppHeader showBackButton={true} title={kandidat?.nachname + ' ' + kandidat?.vorname} subtitle="{fach?.kurzform} · Klasse {kandidat?.klasse}" />
		
		<main class="detail-content">
			<!-- Timeline visual indicator -->
			<div class="timeline-banner status-{status}">
				<div class="timeline-container">
					<div class="timeline-line">
						<div class="timeline-progress" style="width: {status === 'done' ? '100%' : (status === 'exam' ? '50%' : (status === 'prep' ? '12.5%' : '0%'))}"></div>
					</div>
					<div class="timeline-stops">
						<div class="stop" class:active={status !== 'waiting'}>
							<div class="dot"></div>
							<span>Start</span>
						</div>
						<div class="stop" class:active={status === 'exam' || status === 'done'}>
							<div class="dot"></div>
							<span>Beginn</span>
						</div>
						<div class="stop" class:active={status === 'done'}>
							<div class="dot"></div>
							<span>Ende</span>
						</div>
					</div>
				</div>
			</div>

			<div class="two-column-layout">
				<!-- LEFT PANEL -->
				<div class="left-panel">
					
					<section class="info-section">
						<h2 class="section-label">KANDIDAT</h2>
						<div class="card-content">
							<h1 class="font-display name-large">{kandidat?.nachname} <span class="font-sans font-normal">{kandidat?.vorname}</span></h1>
							<p class="klasse-info">Klasse: {kandidat?.klasse}</p>
						</div>
					</section>

					<hr class="divider" />

					<section class="info-section">
						<h2 class="section-label">PRÜFUNGSFACH</h2>
						<div class="card-content">
							<div class="fach-header">
								<h3 class="fach-name">{fach?.bezeichnung}</h3>
								<FachChip kurzform={fach?.kurzform || ''} />
							</div>
						</div>
					</section>

					<hr class="divider" />

					<section class="info-section commission-section">
						<h2 class="section-label">KOMMISSION</h2>
						<div class="card-content">
							<CommissionPanel 
								label="KV/Stv." 
								members={store.kommission} 
								selectedId={antritt?.kvId || null} 
								readonly={store.userRole !== 'admin'}
								onChange={(id) => updateCommission('kvId', id)} 
							/>
							<CommissionPanel 
								label="Prüfer/in" 
								members={store.kommission} 
								selectedId={antritt?.prueferId || null} 
								readonly={store.userRole !== 'admin'}
								onChange={(id) => updateCommission('prueferId', id)} 
							/>
							<CommissionPanel 
								label="Beisitz" 
								members={store.kommission} 
								selectedId={antritt?.beisitzId || null} 
								readonly={store.userRole !== 'admin'}
								onChange={(id) => updateCommission('beisitzId', id)} 
							/>
						</div>
					</section>

					<hr class="divider" />

					<section class="info-section">
						<h2 class="section-label">ZEITPLAN</h2>
						<div class="card-content timeline-slots">
							<TimeSlot 
								label="Start VB" 
								value={antritt?.startVB || null} 
								readonly={store.userRole !== 'admin'}
								onChange={(t) => updateTime('startVB', t)} 
							/>
							<TimeSlot 
								label="Beginn" 
								value={antritt?.beginn || null} 
								readonly={store.userRole !== 'admin'}
								onChange={(t) => updateTime('beginn', t)} 
							/>
							<TimeSlot 
								label="Ende" 
								value={antritt?.ende || null} 
								readonly={store.userRole !== 'admin'}
								onChange={(t) => updateTime('ende', t)} 
							/>
						</div>
					</section>
				</div>

				<!-- RIGHT PANEL -->
				<div class="right-panel">
					{#if store.userRole === 'admin'}
						<TopicAdminSelection 
							availableTopics={store.getThemengebieteForFach(antritt!.fachId)}
							drawnTopic1Id={antritt?.thema1Id}
							drawnTopic2Id={antritt?.thema2Id}
							selectedTopicId={antritt?.themenwahl}
							onDraw={handleDrawTopics}
							onSelect={handleSelectTopic}
						/>
					{:else}
						<TopicDraw 
							availableTopics={store.getThemengebieteForFach(antritt!.fachId)}
							drawnTopic1={antritt?.thema1Id ? store.themengebiete.find(t => String(t.id) === String(antritt!.thema1Id)) : null}
							drawnTopic2={antritt?.thema2Id ? store.themengebiete.find(t => String(t.id) === String(antritt!.thema2Id)) : null}
							selectedTopicId={antritt?.themenwahl || null}
							onDraw={handleDrawTopics}
							onSelect={handleSelectTopic}
							onDrawRequest={handleDrawRequest}
						/>
					{/if}
					
					{#if antritt?.themenwahl}
						<div class="aufgaben-nr mt-4">
							<label for="aufgaben-nr" class="grade-label">Aufgaben-Nr.:</label>
							{#if store.userRole === 'admin'}
								<select 
									id="aufgaben-nr"
									class="aufgaben-input font-mono" 
									onchange={handleAufgabenNr}
								>
									<option value="" selected={antritt?.aufgabeNr == null}>—</option>
									<option value="1" selected={antritt?.aufgabeNr === 1}>1</option>
									<option value="2" selected={antritt?.aufgabeNr === 2}>2</option>
									<option value="3" selected={antritt?.aufgabeNr === 3}>3</option>
								</select>
							{:else}
								<div class="aufgaben-display font-mono">
									{antritt?.aufgabeNr || '—'}
								</div>
							{/if}
						</div>
					{/if}

					{#if store.userRole === 'admin'}
						<div class="beurteilung-section mt-6">
							<h3 class="section-label beurteilung-label">BEURTEILUNG</h3>
							<div class="beurteilung-card">
								<div class="grade-row">
									<span class="grade-label">Prüfungsnote:</span>
									<div class="flex-1">
										<GradeSelector 
											value={antritt?.pruefungsnote || null} 
											onChange={handleGradeChange} 
										/>
									</div>
								</div>
								
								<div class="grade-row">
									<span class="grade-label">Jahresnote:</span>
									<div class="year-grade-display font-mono">
										{antritt?.jahresnote || '—'}
									</div>
								</div>

								<hr class="divider my-4" />

								<div class="final-grade">
									<span class="final-grade-label">Maturazeugnis:</span>
									<span class="final-grade-value font-mono">
										{#if antritt?.maturanote}
											<span class="equals-sign">=</span> {antritt.maturanote}
										{:else}
											<span class="muted-text">—</span>
										{/if}
									</span>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>

		</main>
	{:else}
		<div class="not-found">
			<h2>Antritt nicht gefunden</h2>
			<a href="{base}/">Zurück zur Übersicht</a>
		</div>
	{/if}
</div>

<style>
	.page-container {
		min-height: 100vh;
		background-color: var(--color-bg-base);
		position: relative;
	}

	.error-toast {
		position: fixed;
		top: 5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1.25rem;
		background-color: #fffbeb;
		border: 1px solid #fcd34d;
		border-radius: var(--radius-md);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		color: #92400e;
		min-width: 320px;
	}

	:root:not(.light) .error-toast {
		background-color: #451a03;
		border-color: #92400e;
		color: #fef3c7;
	}

	.error-icon {
		font-size: 1.25rem;
	}

	.error-message {
		flex: 1;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.close-error {
		background: none;
		border: none;
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		color: inherit;
		opacity: 0.5;
		transition: opacity 150ms;
		padding: 0 0.25rem;
	}

	.close-error:hover {
		opacity: 1;
	}
	
	.detail-content {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem;
	}
	
	.timeline-banner {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background-color: var(--color-bg-surface);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		display: none; /* Desktop only enhancement */
	}
	
	@media (min-width: 768px) {
		.timeline-banner {
			display: block;
		}
	}
	
	.timeline-container {
		position: relative;
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
	}
	
	.timeline-line {
		position: absolute;
		top: 6px;
		left: 0;
		right: 0;
		height: 2px;
		background-color: var(--color-border);
		z-index: 1;
	}
	
	.timeline-progress {
		height: 100%;
		background-color: var(--status-color, var(--color-accent));
		transition: all 400ms ease;
	}
	
	.timeline-banner.status-waiting { --status-color: var(--color-state-waiting); }
	.timeline-banner.status-prep { --status-color: var(--color-state-prep); }
	.timeline-banner.status-exam { --status-color: var(--color-state-exam); }
	.timeline-banner.status-done { --status-color: var(--color-state-done); }
	
	.timeline-stops {
		position: relative;
		z-index: 2;
		display: flex;
		justify-content: space-between;
	}
	
	.stop {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		color: var(--color-text-muted);
	}
	
	.stop.active {
		color: var(--color-text-primary);
	}
	
	.stop.active .dot {
		background-color: var(--status-color, var(--color-accent));
		border-color: var(--color-bg-surface);
		box-shadow: 0 0 0 4px var(--color-bg-surface);
	}
	
	.dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background-color: var(--color-bg-elevated);
		border: 2px solid var(--color-border);
		transition: all 300ms ease;
	}
	
	.stop span {
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
	
	.two-column-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}
	
	@media (min-width: 768px) {
		.two-column-layout {
			grid-template-columns: 4fr 6fr;
		}
	}
	
	/* Left Panel Styles */
	.left-panel {
		display: flex;
		flex-direction: column;
	}
	
	.section-label {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0 0 1rem 0;
	}
	
	.info-section {
		padding: 1rem 0;
	}
	
	.info-section:first-child {
		padding-top: 0;
	}
	
	.divider {
		border: 0;
		border-top: 1px solid var(--color-border);
		margin: 0;
	}
	
	.card-content {
		padding-left: 0.5rem;
	}
	
	.name-large {
		font-size: 2.5rem;
		line-height: 1.1;
		color: var(--color-text-primary);
		margin: 0 0 0.5rem 0;
	}
	
	@media (max-width: 640px) {
		.name-large {
			font-size: 1.75rem;
		}
	}
	
	.klasse-info {
		font-size: 1rem;
		color: var(--color-text-secondary);
		margin: 0;
	}
	
	.fach-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	.fach-name {
		font-size: 1.25rem;
		font-weight: 500;
		color: var(--color-text-primary);
		margin: 0;
	}

	.timeline-slots {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 1rem;
	}
	
	/* Right Panel Styles */
	.right-panel {
		display: flex;
		flex-direction: column;
	}
	
	.mt-6 {
		margin-top: 2rem;
	}
	
	.mt-4 {
		margin-top: 1rem;
	}
	
	.beurteilung-label {
		margin-bottom: 0.5rem;
	}
	
	.beurteilung-card {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 1.5rem;
	}
	
	.aufgaben-nr {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 1rem 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	@media (max-width: 640px) {
		.aufgaben-nr {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
			padding: 1rem;
		}
		
		.aufgaben-input, .aufgaben-display {
			width: 100%;
		}
	}
	
	.aufgaben-input {
		flex: 1;
		padding: 0.75rem;
		background-color: var(--color-bg-elevated);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 1rem;
	}
	
	.aufgaben-input:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.aufgaben-display {
		flex: 1;
		padding: 0.75rem;
		background-color: var(--color-bg-base);
		color: var(--color-accent);
		border-radius: var(--radius-sm);
		font-size: 1.125rem;
		font-weight: 500;
	}
	
	.grade-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	
	.grade-row:last-of-type {
		margin-bottom: 0;
	}
	
	.grade-label {
		flex: 0 0 auto;
		width: 8rem;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}
	
	.flex-1 {
		flex: 1;
	}
	
	.year-grade-display {
		width: 4rem;
		padding: 0.75rem;
		background-color: var(--color-bg-base);
		color: var(--color-accent);
		border-radius: var(--radius-sm);
		font-size: 1.125rem;
		font-weight: 500;
		text-align: center;
	}
	
	.my-4 {
		margin-top: 1.5rem;
		margin-bottom: 1.5rem;
	}
	
	.final-grade {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.final-grade-label {
		flex: 0 0 auto;
		width: 8rem;
		font-size: 0.875rem;
		color: var(--color-text-primary);
		font-weight: 600;
	}
	
	.final-grade-value {
		font-size: 1.25rem;
		color: var(--color-text-primary);
	}
	
	.equals-sign {
		color: var(--color-text-muted);
		margin-right: 0.5rem;
	}
	
	.muted-text {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		font-family: var(--font-sans);
		margin-left: 0.5rem;
	}
	
	.not-found {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem;
		color: var(--color-text-secondary);
	}
	
	@media (max-width: 640px) {
		.grade-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.grade-label {
			width: 100%;
		}

		.grade-row .flex-1 {
			width: 100%;
		}

		.year-grade-display {
			width: 100%;
		}

		.final-grade {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.final-grade-label {
			width: 100%;
		}
	}
	
	@media (max-width: 640px) {
		.detail-content {
			padding: 1rem 0.5rem;
		}

		.timeline-slots, .beurteilung-card, .aufgaben-nr {
			padding: 1rem 0.75rem;
		}
	}
</style>
