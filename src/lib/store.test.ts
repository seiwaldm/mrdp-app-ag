import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store } from './store.svelte';

describe('MrdpStore', () => {
	beforeEach(() => {
		// Clear and setup mock data
		store.kandidaten = [
			{ id: 1, vorname: 'Max', nachname: 'Huber', klasse: '5AHIT' }
		];
		store.faecher = [
			{ id: 1, bezeichnung: 'Betriebswirtschaft', kurzform: 'BWM' }
		];
		store.themengebiete = [
			{ id: 101, bezeichnung: 'Marketing', fachId: 1 },
			{ id: 102, bezeichnung: 'Finanzierung', fachId: 1 },
			{ id: 103, bezeichnung: 'Recht', fachId: 1 }
		];
		store.antritte = [
			{ 
				id: 1, 
				kandidatId: 1, 
				fachId: 1, 
				startVB: '2026-03-16T08:00',
				beginn: '2026-03-16T08:30',
				ende: '2026-03-16T09:00',
				thema1Id: null,
				thema2Id: null,
				pruefungsnote: null,
				jahresnote: null,
				kvId: null,
				prueferId: null,
				beisitzId: null
			},
			{ 
				id: 2, 
				kandidatId: 1, 
				fachId: 1, 
				startVB: '2026-03-16T09:00',
				beginn: '2026-03-16T09:30',
				ende: null,
				thema1Id: null,
				thema2Id: null,
				pruefungsnote: null,
				jahresnote: null,
				kvId: null,
				prueferId: null,
				beisitzId: null
			}
		];
		store.now = new Date('2026-03-16T09:45'); // Past the end of antritt 1, during antritt 2 (if it had an end)
		store.error = null;
	});

	it('should find a candidate by ID', () => {
		const kandidat = store.getKandidat(1);
		expect(kandidat).toBeDefined();
		expect(kandidat?.nachname).toBe('Huber');
	});

	it('should find a subject by ID', () => {
		const fach = store.getFach(1);
		expect(fach).toBeDefined();
		expect(fach?.kurzform).toBe('BWM');
	});

	it('should return correct exam state', () => {
		// Mock now to be after antritt 1
		store.now = new Date('2026-03-16T09:15');
		const antritt = store.getAntritt(1);
		if (!antritt) throw new Error('Antritt 1 not found');
		expect(store.getExamState(antritt)).toBe('done');

		// Mock now to be during antritt 2 preparation
		store.now = new Date('2026-03-16T09:15');
		const antritt2 = store.getAntritt(2);
		if (!antritt2) throw new Error('Antritt 2 not found');
		expect(store.getExamState(antritt2)).toBe('prep');
	});

	it('should update an antritt', () => {
		store.updateAntritt(1, { pruefungsnote: 1 });
		const antritt = store.getAntritt(1);
		expect(antritt?.pruefungsnote).toBe(1);
	});

	it('should draw topics randomly', async () => {
		await store.drawTopics(1);
		const antritt = store.getAntritt(1);
		expect(antritt?.thema1Id).not.toBeNull();
		expect(antritt?.thema2Id).not.toBeNull();
		expect(antritt?.thema1Id).not.toBe(antritt?.thema2Id);
	});
});
