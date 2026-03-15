import { supabase } from './supabase';
import type { Antritt, ExamState, Fach, Kandidat, Kommissionsmitglied, Themengebiet } from './types';

class MrdpStore {
	kandidaten = $state<Kandidat[]>([]);
	faecher = $state<Fach[]>([]);
	themengebiete = $state<Themengebiet[]>([]);
	kommission = $state<Kommissionsmitglied[]>([]);
	antritte = $state<Antritt[]>([]);
	theme = $state<'light' | 'dark'>('dark');
	loading = $state(true);
	error = $state<string | null>(null);
	now = $state<Date>(new Date());
	// Map of antrittId -> { startVB: fullISO, beginn: fullISO, ende: fullISO }
	private _fullDates = new Map<string | number, { startVB: string | null, beginn: string | null, ende: string | null }>();

	private formatTime(iso: string | null): string | null {
		if (!iso) return null;
		try {
			// Supabase returns timestamptz as ISO string. 
			// We want HH:mm in local time (or just the time part if it's stored correctly)
			const date = new Date(iso);
			if (isNaN(date.getTime())) return null;
			return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
		} catch (e) {
			return null;
		}
	}

	private mergeTimeIntoISO(existingISO: string | null, newTime: string | null): string | null {
		if (!newTime) return null;
		
		// newTime is "HH:mm"
		const [hours, minutes] = newTime.split(':').map(Number);
		const date = existingISO ? new Date(existingISO) : new Date();
		
		date.setHours(hours, minutes, 0, 0);
		return date.toISOString();
	}

	async init() {
		this.loading = true;
		this.error = null;

		// Update 'now' every minute
		if (typeof window !== 'undefined') {
			setInterval(() => {
				this.now = new Date();
			}, 60000);
		}

		try {
			const [
				{ data: candidates },
				{ data: subjects },
				{ data: topics },
				{ data: commission },
				{ data: entries }
			] = await Promise.all([
				supabase.from('kandidaten').select('*'),
				supabase.from('faecher').select('*'),
				supabase.from('themengegebiete').select('*'),
				supabase.from('kommissionsmitglieder').select('*'),
				supabase.from('antritte').select('*')
			]);

			this.kandidaten = (candidates || []) as Kandidat[];
			this.faecher = (subjects || []) as Fach[];
			this.themengebiete = (topics || []).map((t: any) => ({
				id: t.id,
				bezeichnung: t.bezeichnung,
				fachId: t.fach_id
			})) as Themengebiet[];
			this.kommission = (commission || []) as Kommissionsmitglied[];
			
			this.antritte = (entries || []).map((a: any) => {
				// Store full dates for later updates
				this._fullDates.set(a.id, {
					startVB: a.start_vb,
					beginn: a.beginn,
					ende: a.ende
				});

				return {
					id: a.id,
					kandidatId: a.kandidat_id,
					fachId: a.fach_id,
					startVB: this.formatTime(a.start_vb),
					beginn: this.formatTime(a.beginn),
					ende: this.formatTime(a.ende),
					thema1Id: a.thema1_id,
					thema2Id: a.thema2_id,
					themenwahl: a.themenwahl,
					prueferId: a.pruefer_id,
					beisitzId: a.beisitz_id,
					kvId: a.kv_id,
					aufgabeNr: a.aufgabe_nr,
					pruefungsnote: a.pruefungsnote,
					jahresnote: a.jahresnote
				};
			}) as Antritt[];
		} catch (e: any) {
			console.error('Failed to load data from Supabase', e);
			this.error = e.message || 'Unknown error';
		} finally {
			this.loading = false;
		}
	}

	private saveToLocalStorage() {
		if (typeof window !== 'undefined') {
			localStorage.setItem('mrdp_theme', this.theme);
		}
	}

	toggleTheme() {
		this.theme = this.theme === 'light' ? 'dark' : 'light';
		this.saveToLocalStorage();
		this.applyTheme();
	}

	private applyTheme() {
		if (typeof document !== 'undefined') {
			if (this.theme === 'light') {
				document.documentElement.classList.add('light');
			} else {
				document.documentElement.classList.remove('light');
			}
		}
	}

	getAntritt(id: string | number): Antritt | undefined {
		return this.antritte.find((a) => String(a.id) === String(id));
	}

	getKandidat(id: string | number): Kandidat | undefined {
		return this.kandidaten.find((k) => String(k.id) === String(id));
	}

	getFach(id: string | number): Fach | undefined {
		return this.faecher.find((f) => String(f.id) === String(id));
	}

	getThemengebieteForFach(fachId: string | number): Themengebiet[] {
		return this.themengebiete.filter((t) => String(t.fachId) === String(fachId));
	}

	getKommissionsmitglied(id: string | number): Kommissionsmitglied | undefined {
		return this.kommission.find((m) => String(m.id) === String(id));
	}

	private isTimePassed(time: string | null): boolean {
		if (!time) return false;
		
		const [hours, minutes] = time.split(':').map(Number);
		const timeDate = new Date(this.now);
		timeDate.setHours(hours, minutes, 0, 0);
		
		return this.now >= timeDate;
	}

	getExamState(antritt: Antritt): ExamState {
		if (this.isTimePassed(antritt.ende)) return 'done';
		if (this.isTimePassed(antritt.beginn)) return 'exam';
		if (this.isTimePassed(antritt.startVB)) return 'prep';
		return 'waiting';
	}

	async updateAntritt(id: string | number, updates: Partial<Antritt>) {
		const index = this.antritte.findIndex((a) => String(a.id) === String(id));
		if (index !== -1) {
			const existingRaw = this._fullDates.get(id);
			
			// Update local state (UI formatted)
			this.antritte[index] = { ...this.antritte[index], ...updates };

			// Map back to snake_case for Supabase
			const dbUpdates: any = {};
			if ('kandidatId' in updates) dbUpdates.kandidat_id = updates.kandidatId;
			if ('fachId' in updates) dbUpdates.fach_id = updates.fachId;
			
			if ('startVB' in updates) {
				dbUpdates.start_vb = this.mergeTimeIntoISO(existingRaw?.startVB || null, updates.startVB || null);
				if (existingRaw) existingRaw.startVB = dbUpdates.start_vb;
			}
			if ('beginn' in updates) {
				dbUpdates.beginn = this.mergeTimeIntoISO(existingRaw?.beginn || null, updates.beginn || null);
				if (existingRaw) existingRaw.beginn = dbUpdates.beginn;
			}
			if ('ende' in updates) {
				dbUpdates.ende = this.mergeTimeIntoISO(existingRaw?.ende || null, updates.ende || null);
				if (existingRaw) existingRaw.ende = dbUpdates.ende;
			}
			
			if ('thema1Id' in updates) dbUpdates.thema1_id = updates.thema1Id;
			if ('thema2Id' in updates) dbUpdates.thema2_id = updates.thema2Id;
			if ('themenwahl' in updates) dbUpdates.themenwahl = updates.themenwahl;
			if ('prueferId' in updates) dbUpdates.pruefer_id = updates.prueferId;
			if ('beisitzId' in updates) dbUpdates.beisitz_id = updates.beisitzId;
			if ('kvId' in updates) dbUpdates.kv_id = updates.kvId;
			if ('aufgabeNr' in updates) dbUpdates.aufgabe_nr = updates.aufgabeNr;
			if ('pruefungsnote' in updates) dbUpdates.pruefungsnote = updates.pruefungsnote;
			if ('jahresnote' in updates) dbUpdates.jahresnote = updates.jahresnote;

			const { error } = await supabase
				.from('antritte')
				.update(dbUpdates)
				.eq('id', id);

			if (error) {
				console.error('Failed to update antritt in Supabase', error);
				this.error = error.message;
			}
		}
	}

	async drawTopics(antrittId: string | number) {
		const antritt = this.getAntritt(antrittId);
		if (!antritt) return;

		const availableTopics = this.getThemengebieteForFach(antritt.fachId);
		if (availableTopics.length < 2) return;

		const shuffled = [...availableTopics].sort(() => 0.5 - Math.random());
		const thema1 = shuffled[0];
		const thema2 = shuffled[1];

		await this.updateAntritt(antrittId, {
			thema1Id: thema1.id,
			thema2Id: thema2.id,
			themenwahl: null
		});
	}

	reset() {
		// Reset is no longer applicable with live DB or should be restricted
		// For now we just re-fetch
		this.init();
	}
}

export const store = new MrdpStore();
