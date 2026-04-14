import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store } from './store.svelte';

vi.mock('./supabase', () => {
	const chain: any = {
		select: vi.fn().mockReturnThis(),
	};
	chain.update = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) });
	chain.upsert = vi.fn().mockResolvedValue({ data: null, error: null });

	return {
		supabase: {
			from: vi.fn(() => chain),
			auth: {
				getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
				onAuthStateChange: vi.fn()
			},
			channel: vi.fn(() => {
				const ch: any = {
					on: vi.fn(() => ch),
					subscribe: vi.fn(() => ch)
				};
				return ch;
			}),
			removeChannel: vi.fn()
		}
	};
});

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
			{ id: 101, bezeichnung: 'Marketing', fachId: 1, nr: 1 },
			{ id: 102, bezeichnung: 'Finanzierung', fachId: 1, nr: 2 },
			{ id: 103, bezeichnung: 'Recht', fachId: 1, nr: 3 }
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

	describe('Maturanote Calculation', () => {
		it('should calculate the mean for integer results', () => {
			expect(store.calculateMaturanote(2, 4)).toBe(3);
			expect(store.calculateMaturanote(1, 3)).toBe(2);
		});

		it('should use the pruefungsnote for x.5 results', () => {
			// (2+3)/2 = 2.5
			expect(store.calculateMaturanote(3, 2)).toBe(2); // jn=3, pn=2 -> 2
			expect(store.calculateMaturanote(2, 3)).toBe(3); // jn=2, pn=3 -> 3
			
			// (1+2)/2 = 1.5
			expect(store.calculateMaturanote(2, 1)).toBe(1); // jn=2, pn=1 -> 1
			expect(store.calculateMaturanote(1, 2)).toBe(2); // jn=1, pn=2 -> 2

			// (2+5)/2 = 3.5
			expect(store.calculateMaturanote(2, 5)).toBe(4); // jn=2, pn=5 -> 4
			expect(store.calculateMaturanote(5, 2)).toBe(3); // jn=5, pn=2 -> 3
		});

		it('should return null if any note is missing', () => {
			expect(store.calculateMaturanote(null, 2)).toBeNull();
			expect(store.calculateMaturanote(3, null)).toBeNull();
			expect(store.calculateMaturanote(null, null)).toBeNull();
		});

		it('should automatically update maturanote in updateAntritt', async () => {
			store.userRole = 'admin';
			await store.updateAntritt(1, { jahresnote: 3, pruefungsnote: 2 });
			const antritt = store.getAntritt(1);
			expect(antritt?.maturanote).toBe(2);
		});
	});
});
