import { supabase } from './supabase';
import { base } from '$app/paths';
import type { Antritt, ExamState, Fach, Kandidat, Kommissionsmitglied, Themengebiet, UserRole } from './types';

class MrdpStore {
	kandidaten = $state<Kandidat[]>([]);
	faecher = $state<Fach[]>([]);
	themengebiete = $state<Themengebiet[]>([]);
	kommission = $state<Kommissionsmitglied[]>([]);
	antritte = $state<Antritt[]>([]);
	theme = $state<'light' | 'dark'>('light');
	loading = $state(true);
	error = $state<string | null>(null);
	now = $state<Date>(new Date());
	selectedDate = $state<string | null>(null);
	user = $state<any>(null);
	session = $state<any>(null);
	userRole = $state<UserRole | null>(null);
	private authInitialized = false;
	private realtimeChannel: any = null;

	// Helper to format ISO to YYYY-MM-DDTHH:mm for datetime-local input
	private formatToDateTimeLocal(iso: string | null): string | null {
		if (!iso) return null;
		const date = new Date(iso);
		if (isNaN(date.getTime())) return null;
		
		const pad = (n: number) => String(n).padStart(2, '0');
		const y = date.getFullYear();
		const m = pad(date.getMonth() + 1);
		const d = pad(date.getDate());
		const h = pad(date.getHours());
		const min = pad(date.getMinutes());
		
		return `${y}-${m}-${d}T${h}:${min}`;
	}

	// Helper to format any date/time string to HH:mm for table display
	formatToTimeOnly(iso: string | null): string {
		if (!iso) return '—';
		try {
			const date = new Date(iso);
			if (isNaN(date.getTime())) return '—';
			return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false });
		} catch {
			return '—';
		}
	}

	calculateMaturanote(jn: number | null, pn: number | null): number | null {
		if (jn === null || pn === null) return null;
		const sum = jn + pn;
		return sum % 2 === 0 ? sum / 2 : pn;
	}

	async init() {
		this.loading = true;
		this.error = null;

		// Initialize auth listener once
		if (!this.authInitialized) {
			this.initAuth();
			this.authInitialized = true;
		}

		// Load theme from localStorage
		this.loadFromLocalStorage();

		// Update 'now' every minute
		if (typeof window !== 'undefined') {
			setInterval(() => {
				this.now = new Date();
			}, 60000);
		}

		// Wait for initial session check
		const { data: { session } } = await supabase.auth.getSession();
		this.session = session;
		this.user = session?.user ?? null;

		if (!this.session) {
			this.userRole = null;
			this.loading = false;
			return;
		}

		// Fetch user role
		const { data: roleData } = await supabase
			.from('user_roles')
			.select('role')
			.eq('id', this.user.id)
			.single();
		this.userRole = (roleData?.role as UserRole) || 'user';

		try {
			const antritteQuery = this.userRole === 'admin'
				? supabase.from('antritte').select('*, antritte_noten(*)')
				: supabase.from('antritte').select('*, antritte_noten(id, maturanote)');

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
				antritteQuery
			]);

			this.kandidaten = (candidates || []) as Kandidat[];
			this.faecher = (subjects || []) as Fach[];
			this.themengebiete = (topics || []).map((t: any) => ({
				id: t.id,
				bezeichnung: t.bezeichnung,
				fachId: t.fach_id,
				nr: t.nr
			})) as Themengebiet[];
			this.kommission = (commission || []) as Kommissionsmitglied[];
			
			this.antritte = (entries || []).map((a: any) => ({
				id: a.id,
				kandidatId: a.kandidat_id,
				fachId: a.fach_id,
				startVB: this.formatToDateTimeLocal(a.start_vb),
				beginn: this.formatToDateTimeLocal(a.beginn),
				ende: this.formatToDateTimeLocal(a.ende),
				thema1Id: a.thema1_id,
				thema2Id: a.thema2_id,
				themenwahl: a.themenwahl,
				prueferId: a.pruefer_id,
				beisitzId: a.beisitz_id,
				kvId: a.kv_id,
				aufgabeNr: a.aufgabe_nr,
				pruefungsnote: (a.antritte_noten?.[0] || a.antritte_noten)?.pruefungsnote ?? null,
				jahresnote: (a.antritte_noten?.[0] || a.antritte_noten)?.jahresnote ?? null,
				maturanote: (a.antritte_noten?.[0] || a.antritte_noten)?.maturanote ?? null
			})) as Antritt[];
		} catch (e: any) {
			console.error('Failed to load data from Supabase', e);
			this.error = e.message || 'Unknown error';
		} finally {
			// Initialize selectedDate if not set
			if (!this.selectedDate && this.antritte.length > 0) {
				const dates = [...new Set(this.antritte.map(a => a.startVB?.split('T')[0]))].filter(Boolean).sort();
				if (dates.length > 0) {
					this.selectedDate = dates[0] as string;
				}
			}
			this.loading = false;
			
			if (this.session) {
				this.initRealtime();
			}
		}
	}

	private loadFromLocalStorage() {
		if (typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem('mrdp_theme');
			if (savedTheme === 'light' || savedTheme === 'dark') {
				this.theme = savedTheme;
			}
			this.applyTheme();
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

	private initAuth() {
		supabase.auth.onAuthStateChange((_event, session) => {
			this.session = session;
			this.user = session?.user ?? null;
			
			// If we just logged in and have no data, fetch it
			if (session && this.antritte.length === 0) {
				this.init();
			}
			
			if (!session) {
				this.cleanupRealtime();
			}
		});
	}

	private initRealtime() {
		if (this.realtimeChannel) return;

		this.realtimeChannel = supabase.channel('antritte-changes')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'antritte' },
				(payload) => {
					this.handleRealtimeUpdate('antritte', payload);
				}
			)
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'antritte_noten' },
				(payload) => {
					this.handleRealtimeUpdate('antritte_noten', payload);
				}
			)
			.subscribe();
	}

	private cleanupRealtime() {
		if (this.realtimeChannel) {
			supabase.removeChannel(this.realtimeChannel);
			this.realtimeChannel = null;
		}
	}

	private handleRealtimeUpdate(table: string, payload: any) {
		if (table === 'antritte') {
			if (payload.eventType === 'INSERT') {
				// We refresh to correctly join data, but do it quietly
				this.init();
			} else if (payload.eventType === 'UPDATE') {
				const updated = payload.new;
				const existing = this.antritte.find(a => String(a.id) === String(updated.id));
				if (existing) {
					existing.kandidatId = updated.kandidat_id;
					existing.fachId = updated.fach_id;
					existing.startVB = this.formatToDateTimeLocal(updated.start_vb);
					existing.beginn = this.formatToDateTimeLocal(updated.beginn);
					existing.ende = this.formatToDateTimeLocal(updated.ende);
					existing.thema1Id = updated.thema1_id;
					existing.thema2Id = updated.thema2_id;
					existing.themenwahl = updated.themenwahl;
					existing.prueferId = updated.pruefer_id;
					existing.beisitzId = updated.beisitz_id;
					existing.kvId = updated.kv_id;
					existing.aufgabeNr = updated.aufgabe_nr;
				}
			} else if (payload.eventType === 'DELETE') {
				this.antritte = this.antritte.filter(a => String(a.id) !== String(payload.old.id));
			}
		} else if (table === 'antritte_noten') {
			if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
				const updated = payload.new;
				const existing = this.antritte.find(a => String(a.id) === String(updated.id));
				if (existing) {
					if ('pruefungsnote' in updated) existing.pruefungsnote = updated.pruefungsnote;
					if ('jahresnote' in updated) existing.jahresnote = updated.jahresnote;
					if ('maturanote' in updated) existing.maturanote = updated.maturanote;
				}
			} else if (payload.eventType === 'DELETE') {
				const existing = this.antritte.find(a => String(a.id) === String(payload.old.id));
				if (existing) {
					existing.pruefungsnote = null;
					existing.jahresnote = null;
					existing.maturanote = null;
				}
			}
		}
	}

	async signInWithMagicLink(email: string) {
		const redirectUrl = new URL(`${base}/auth/callback`, window.location.origin).toString();
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: redirectUrl
			}
		});
		if (error) throw error;
	}

	async signOut() {
		this.cleanupRealtime();
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
		// Clear local data
		this.antritte = [];
		this.kandidaten = [];
		this.faecher = [];
		this.themengebiete = [];
		this.kommission = [];
	}

	get authenticated() {
		return !!this.session;
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

	private isTimePassed(iso: string | null): boolean {
		if (!iso) return false;
		const date = new Date(iso);
		return !isNaN(date.getTime()) && this.now >= date;
	}

	getExamState(antritt: Antritt): ExamState {
		if (this.isTimePassed(antritt.ende)) return 'done';
		if (this.isTimePassed(antritt.beginn)) return 'exam';
		if (this.isTimePassed(antritt.startVB)) return 'prep';
		return 'waiting';
	}

	private validateTimeSequence(updates: Partial<Antritt>, existing: Antritt): { valid: boolean; error?: string } {
		const start = 'startVB' in updates ? updates.startVB : existing.startVB;
		const begin = 'beginn' in updates ? updates.beginn : existing.beginn;
		const end = 'ende' in updates ? updates.ende : existing.ende;

		const dStart = start ? new Date(start) : null;
		const dBegin = begin ? new Date(begin) : null;
		const dEnd = end ? new Date(end) : null;

		if (dStart && dBegin && dStart >= dBegin) {
			return { valid: false, error: 'Vorbereitungsbeginn muss vor dem Prüfungsbeginn liegen.' };
		}
		if (dBegin && dEnd && dBegin >= dEnd) {
			return { valid: false, error: 'Prüfungsbeginn muss vor dem Prüfungsende liegen.' };
		}
		if (dStart && dEnd && dStart >= dEnd) {
			return { valid: false, error: 'Vorbereitungsbeginn muss vor dem Prüfungsende liegen.' };
		}
		return { valid: true };
	}

	async updateAntritt(id: string | number, updates: Partial<Antritt>) {
		const index = this.antritte.findIndex((a) => String(a.id) === String(id));
		if (index !== -1) {
			const currentAntritt = this.antritte[index];
			
			// Validate time sequence
			if ('startVB' in updates || 'beginn' in updates || 'ende' in updates) {
				const validation = this.validateTimeSequence(updates, currentAntritt);
				if (!validation.valid) {
					this.error = validation.error || 'Ungültige Zeitabfolge.';
					return;
				}
			}

			// Update local state
			this.antritte[index] = { ...this.antritte[index], ...updates };
			this.error = null; 

			// Map back to snake_case for Supabase
			const dbUpdates: any = {};
			if ('kandidatId' in updates) dbUpdates.kandidat_id = updates.kandidatId;
			if ('fachId' in updates) dbUpdates.fach_id = updates.fachId;
			
			if ('startVB' in updates) dbUpdates.start_vb = updates.startVB ? new Date(updates.startVB).toISOString() : null;
			if ('beginn' in updates) dbUpdates.beginn = updates.beginn ? new Date(updates.beginn).toISOString() : null;
			if ('ende' in updates) dbUpdates.ende = updates.ende ? new Date(updates.ende).toISOString() : null;
			
			if ('thema1Id' in updates) dbUpdates.thema1_id = updates.thema1Id;
			if ('thema2Id' in updates) dbUpdates.thema2_id = updates.thema2Id;
			if ('themenwahl' in updates) dbUpdates.themenwahl = updates.themenwahl;
			if ('prueferId' in updates) dbUpdates.pruefer_id = updates.prueferId;
			if ('beisitzId' in updates) dbUpdates.beisitz_id = updates.beisitzId;
			if ('kvId' in updates) dbUpdates.kv_id = updates.kvId;
			if ('aufgabeNr' in updates) dbUpdates.aufgabe_nr = updates.aufgabeNr;

			const notenUpdates: any = {};
			if ('pruefungsnote' in updates) notenUpdates.pruefungsnote = updates.pruefungsnote;
			if ('jahresnote' in updates) notenUpdates.jahresnote = updates.jahresnote;

			const promises = [];
			if (Object.keys(dbUpdates).length > 0) {
				promises.push(supabase.from('antritte').update(dbUpdates).eq('id', id));
			}
			
			// Recalculate maturanote if needed
			if ('pruefungsnote' in updates || 'jahresnote' in updates) {
				const finalPn = updates.pruefungsnote !== undefined ? updates.pruefungsnote : currentAntritt.pruefungsnote;
				const finalJn = updates.jahresnote !== undefined ? updates.jahresnote : currentAntritt.jahresnote;
				const maturanote = this.calculateMaturanote(finalJn || null, finalPn || null);
				notenUpdates.maturanote = maturanote;
				this.antritte[index].maturanote = maturanote;
			}

			if (Object.keys(notenUpdates).length > 0 && this.userRole === 'admin') {
				promises.push(supabase.from('antritte_noten').upsert({ id, ...notenUpdates }));
			}

			const results = await Promise.all(promises);
			const firstError = results.find(r => r.error)?.error;

			if (firstError) {
				console.error('Failed to update antritt in Supabase', firstError);
				this.error = firstError.message;
				// Rollback local state on DB error? 
				// For now just keeping the error visible.
			}
		}
	}

	async drawTopics(antrittId: string | number) {
		const antritt = this.getAntritt(antrittId);
		if (!antritt) return;

		const availableTopics = this.getThemengebieteForFach(antritt.fachId);
		if (availableTopics.length < 2) return;

		try {
			const { data, error: funcError } = await supabase.functions.invoke('generate-random-numbers', {
				body: { topicCount: availableTopics.length }
			});

			if (funcError || !data || !Array.isArray(data)) {
				throw new Error(funcError?.message || 'Failed to generate random numbers');
			}

			// data is [num1, num2] where each is 1..topicCount
			const thema1 = availableTopics[data[0] - 1];
			const thema2 = availableTopics[data[1] - 1];

			if (!thema1 || !thema2) {
				throw new Error('Invalid topic indices returned from random function');
			}

			await this.updateAntritt(antrittId, {
				thema1Id: thema1.id,
				thema2Id: thema2.id,
				themenwahl: null,
				aufgabeNr: null
			});
		} catch (e: any) {
			console.error('Failed to draw topics via Edge Function:', e);
			this.error = e.message || 'Fehler beim Ziehen der Themen.';
		}
	}

	reset() {
		// Reset is no longer applicable with live DB or should be restricted
		// For now we just re-fetch
		this.init();
	}
}

export const store = new MrdpStore();
