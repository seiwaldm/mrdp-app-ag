import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store } from './store.svelte';

describe('MrdpStore', () => {
	beforeEach(() => {
		localStorage.clear();
		store.reset();
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
		const antritt = store.getAntritt(1);
		if (!antritt) throw new Error('Antritt 1 not found');

		// initial state for a1 in mock is with startVB and beginn
		expect(store.getExamState(antritt)).toBe('done'); // a1 in JSON has 'ende' set

		const antritt2 = store.getAntritt(2);
		if (!antritt2) throw new Error('Antritt 2 not found');
		expect(store.getExamState(antritt2)).toBe('exam'); // a2 in JSON has 'beginn' set
	});

	it('should update an antritt', () => {
		store.updateAntritt(1, { pruefungsnote: 1 });
		const antritt = store.getAntritt(1);
		expect(antritt?.pruefungsnote).toBe(1);
	});

	it('should draw topics randomly', () => {
		store.drawTopics(1);
		const antritt = store.getAntritt(1);
		expect(antritt?.thema1Id).not.toBeNull();
		expect(antritt?.thema2Id).not.toBeNull();
		expect(antritt?.thema1Id).not.toBe(antritt?.thema2Id);
	});
});
