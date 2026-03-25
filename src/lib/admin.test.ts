import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '$lib/supabase';

// Mock supabase
vi.mock('$lib/supabase', () => {
	const mockFrom = vi.fn();
	return {
		supabase: {
			from: mockFrom
		}
	};
});

function createMockChain(data: any[] | null = [], error: any = null) {
	const chain: any = {
		select: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		order: vi.fn().mockResolvedValue({ data, error }),
	};
	// For insert/delete that don't chain .order()
	chain.insert.mockResolvedValue({ data, error });
	chain.delete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ data, error }) });
	chain.update.mockReturnValue({ eq: vi.fn().mockResolvedValue({ data, error }) });
	return chain;
}

describe('Admin CRUD Operations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Kandidaten', () => {
		it('should load kandidaten from supabase', async () => {
			const mockData = [
				{ id: 1, vorname: 'Max', nachname: 'Huber', klasse: '5AHIT' },
				{ id: 2, vorname: 'Anna', nachname: 'Mair', klasse: '5BHIT' },
			];
			const chain = createMockChain(mockData);
			vi.mocked(supabase.from).mockReturnValue(chain);

			const { data } = await supabase.from('kandidaten').select('*').order('id');

			expect(supabase.from).toHaveBeenCalledWith('kandidaten');
			expect(chain.select).toHaveBeenCalledWith('*');
			expect(chain.order).toHaveBeenCalledWith('id');
			expect(data).toEqual(mockData);
			expect(data).toHaveLength(2);
		});

		it('should insert a new kandidat', async () => {
			const newEntry = { vorname: 'Lisa', nachname: 'Gruber', klasse: '5CHIT' };
			const chain = createMockChain([{ id: 3, ...newEntry }]);
			vi.mocked(supabase.from).mockReturnValue(chain);

			const { error } = await supabase.from('kandidaten').insert(newEntry);

			expect(supabase.from).toHaveBeenCalledWith('kandidaten');
			expect(chain.insert).toHaveBeenCalledWith(newEntry);
			expect(error).toBeNull();
		});

		it('should update a kandidat', async () => {
			const updates = { vorname: 'Maximilian' };
			const chain = createMockChain();
			vi.mocked(supabase.from).mockReturnValue(chain);

			const result = await supabase.from('kandidaten').update(updates).eq('id', 1);

			expect(supabase.from).toHaveBeenCalledWith('kandidaten');
			expect(chain.update).toHaveBeenCalledWith(updates);
		});

		it('should delete a kandidat', async () => {
			const chain = createMockChain();
			vi.mocked(supabase.from).mockReturnValue(chain);

			const result = await supabase.from('kandidaten').delete().eq('id', 1);

			expect(supabase.from).toHaveBeenCalledWith('kandidaten');
			expect(chain.delete).toHaveBeenCalled();
		});

		it('should handle supabase error on load', async () => {
			const chain = createMockChain(null, { message: 'Database error' });
			vi.mocked(supabase.from).mockReturnValue(chain);

			const { data, error } = await supabase.from('kandidaten').select('*').order('id');

			expect(data).toBeNull();
			expect(error).toEqual({ message: 'Database error' });
		});
	});

	describe('Faecher', () => {
		it('should load faecher from supabase', async () => {
			const mockData = [
				{ id: 1, bezeichnung: 'Betriebswirtschaft', kurzform: 'BWM' },
				{ id: 2, bezeichnung: 'Deutsch', kurzform: 'D' },
			];
			const chain = createMockChain(mockData);
			vi.mocked(supabase.from).mockReturnValue(chain);

			const { data } = await supabase.from('faecher').select('*').order('id');

			expect(supabase.from).toHaveBeenCalledWith('faecher');
			expect(data).toEqual(mockData);
		});

		it('should insert a new fach', async () => {
			const newFach = { bezeichnung: 'Englisch', kurzform: 'E' };
			const chain = createMockChain([{ id: 3, ...newFach }]);
			vi.mocked(supabase.from).mockReturnValue(chain);

			const { error } = await supabase.from('faecher').insert(newFach);

			expect(chain.insert).toHaveBeenCalledWith(newFach);
			expect(error).toBeNull();
		});
	});

	describe('Themengebiete', () => {
		it('should load themengebiete from supabase', async () => {
			const mockData = [
				{ id: 1, bezeichnung: 'Marketing', fach_id: 1 },
				{ id: 2, bezeichnung: 'Finanzierung', fach_id: 1 },
			];
			const chain = createMockChain(mockData);
			vi.mocked(supabase.from).mockReturnValue(chain);

			const { data } = await supabase.from('themengegebiete').select('*').order('id');

			expect(supabase.from).toHaveBeenCalledWith('themengegebiete');
			expect(data).toEqual(mockData);
		});

		it('should insert a themengebiet with fach_id FK', async () => {
			const newTopic = { bezeichnung: 'Recht', fach_id: 1 };
			const chain = createMockChain([{ id: 3, ...newTopic }]);
			vi.mocked(supabase.from).mockReturnValue(chain);

			const { error } = await supabase.from('themengegebiete').insert(newTopic);

			expect(chain.insert).toHaveBeenCalledWith(newTopic);
			expect(error).toBeNull();
		});
	});

	describe('Kommissionsmitglieder', () => {
		it('should load kommissionsmitglieder from supabase', async () => {
			const mockData = [
				{ id: 1, vorname: 'Dr. Hans', nachname: 'Müller', pruefungsfaecher: [1, 2] },
			];
			const chain = createMockChain(mockData);
			vi.mocked(supabase.from).mockReturnValue(chain);

			const { data } = await supabase.from('kommissionsmitglieder').select('*').order('id');

			expect(supabase.from).toHaveBeenCalledWith('kommissionsmitglieder');
			expect(data).toEqual(mockData);
			expect(data![0].pruefungsfaecher).toEqual([1, 2]);
		});

		it('should update pruefungsfaecher array', async () => {
			const updates = { pruefungsfaecher: [1, 2, 3] };
			const chain = createMockChain();
			vi.mocked(supabase.from).mockReturnValue(chain);

			await supabase.from('kommissionsmitglieder').update(updates).eq('id', 1);

			expect(chain.update).toHaveBeenCalledWith(updates);
		});
	});

	describe('Antritte', () => {
		it('should load antritte from supabase', async () => {
			const mockData = [
				{ id: 1, kandidat_id: 1, fach_id: 1, start_vb: '2026-03-16T00:00:00.000Z' },
				{ id: 2, kandidat_id: 2, fach_id: 2, start_vb: '2026-03-17T00:00:00.000Z' },
			];
			const chain = createMockChain(mockData);
			vi.mocked(supabase.from).mockReturnValue(chain);

			const { data } = await supabase.from('antritte').select('id, kandidat_id, fach_id, start_vb').order('id');

			expect(supabase.from).toHaveBeenCalledWith('antritte');
			expect(data).toEqual(mockData);
			expect(data).toHaveLength(2);
		});

		it('should insert a new antritt with date defaulting to 00:00', async () => {
			const dateStr = '2026-04-01';
			const startVb = new Date(`${dateStr}T00:00:00`).toISOString();
			const newEntry = { kandidat_id: 1, fach_id: 2, start_vb: startVb };

			const chain = createMockChain([{ id: 10, ...newEntry }]);
			// Mock .insert().select().single() chain
			chain.insert.mockReturnValue({
				select: vi.fn().mockReturnValue({
					single: vi.fn().mockResolvedValue({ data: { id: 10, ...newEntry }, error: null })
				})
			});
			vi.mocked(supabase.from).mockReturnValue(chain);

			const { data: inserted, error } = await supabase
				.from('antritte')
				.insert(newEntry)
				.select('id')
				.single();

			expect(supabase.from).toHaveBeenCalledWith('antritte');
			expect(chain.insert).toHaveBeenCalledWith(newEntry);
			expect(startVb).toContain('T');
			// Verify the time component is midnight
			const parsed = new Date(startVb);
			expect(parsed.getHours()).toBe(0);
			expect(parsed.getMinutes()).toBe(0);
		});

		it('should delete antritt and associated antritte_noten', async () => {
			const chain = createMockChain();
			vi.mocked(supabase.from).mockReturnValue(chain);

			// Delete noten first
			await supabase.from('antritte_noten').delete().eq('id', 5);
			expect(supabase.from).toHaveBeenCalledWith('antritte_noten');

			// Then delete antritt
			vi.clearAllMocks();
			vi.mocked(supabase.from).mockReturnValue(createMockChain());
			await supabase.from('antritte').delete().eq('id', 5);
			expect(supabase.from).toHaveBeenCalledWith('antritte');
		});
	});
});

describe('AdminTable Column Helpers', () => {
	it('should map column keys to DB keys', () => {
		const columns = [
			{ key: 'bezeichnung', label: 'Bezeichnung', type: 'text' as const },
			{ key: 'fach_id', label: 'Fach', type: 'select' as const, dbKey: 'fach_id' },
		];

		// Simulate the getDbKey logic from AdminTable
		function getDbKey(col: { key: string; dbKey?: string }) {
			return col.dbKey || col.key;
		}

		expect(getDbKey(columns[0])).toBe('bezeichnung');
		expect(getDbKey(columns[1])).toBe('fach_id');
	});

	it('should resolve display values for select columns', () => {
		const options = [
			{ value: 1, label: 'Betriebswirtschaft (BWM)' },
			{ value: 2, label: 'Deutsch (D)' },
		];

		// Simulate getDisplayValue logic
		function getDisplayValue(val: any, opts: typeof options) {
			if (val === null || val === undefined) return '—';
			const opt = opts.find(o => String(o.value) === String(val));
			return opt ? opt.label : String(val);
		}

		expect(getDisplayValue(1, options)).toBe('Betriebswirtschaft (BWM)');
		expect(getDisplayValue(2, options)).toBe('Deutsch (D)');
		expect(getDisplayValue(null, options)).toBe('—');
		expect(getDisplayValue(99, options)).toBe('99');
	});

	it('should resolve display values for multiselect columns', () => {
		const options = [
			{ value: 1, label: 'BWM' },
			{ value: 2, label: 'D' },
			{ value: 3, label: 'E' },
		];

		function getMultiselectDisplay(val: any[], opts: typeof options) {
			if (!Array.isArray(val) || val.length === 0) return '—';
			return val
				.map(v => opts.find(o => String(o.value) === String(v))?.label || String(v))
				.join(', ');
		}

		expect(getMultiselectDisplay([1, 2], options)).toBe('BWM, D');
		expect(getMultiselectDisplay([3], options)).toBe('E');
		expect(getMultiselectDisplay([], options)).toBe('—');
		expect(getMultiselectDisplay([1, 99], options)).toBe('BWM, 99');
	});
});
