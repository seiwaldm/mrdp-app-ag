import mockData from './data/mock.json';
import type { Antritt, ExamState, Fach, Kandidat, Kommissionsmitglied, Themengebiet } from './types';

class MrdpStore {
	kandidaten = $state<Kandidat[]>(mockData.kandidaten as Kandidat[]);
	faecher = $state<Fach[]>(mockData.faecher as Fach[]);
	themengebiete = $state<Themengebiet[]>(mockData.themengebiete as Themengebiet[]);
	kommission = $state<Kommissionsmitglied[]>(mockData.kommissionsmitglieder as Kommissionsmitglied[]);
	antritte = $state<Antritt[]>(mockData.antritte as Antritt[]);
	theme = $state<'light' | 'dark'>('dark');

	constructor() {
		// Load from localStorage if available (client-side only)
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('mrdp_antritte');
			if (saved) {
				try {
					this.antritte = JSON.parse(saved);
				} catch (e) {
					console.error('Failed to parse localStorage data', e);
				}
			}

			const savedTheme = localStorage.getItem('mrdp_theme');
			if (savedTheme === 'light' || savedTheme === 'dark') {
				this.theme = savedTheme;
			} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
				this.theme = 'light';
			}
			
			this.applyTheme();
		}
	}

	private saveToLocalStorage() {
		if (typeof window !== 'undefined') {
			localStorage.setItem('mrdp_antritte', JSON.stringify(this.antritte));
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

	getExamState(antritt: Antritt): ExamState {
		if (antritt.ende) return 'done';
		if (antritt.beginn) return 'exam';
		if (antritt.startVB) return 'prep';
		return 'waiting';
	}

	updateAntritt(id: string | number, updates: Partial<Antritt>) {
		const index = this.antritte.findIndex((a) => String(a.id) === String(id));
		if (index !== -1) {
			this.antritte[index] = { ...this.antritte[index], ...updates };
			this.saveToLocalStorage();
		}
	}

	drawTopics(antrittId: string | number) {
		const antritt = this.getAntritt(antrittId);
		if (!antritt) return;

		const availableTopics = this.getThemengebieteForFach(antritt.fachId);
		if (availableTopics.length < 2) return;

		// Shuffle and pick 2
		const shuffled = [...availableTopics].sort(() => 0.5 - Math.random());
		const thema1 = shuffled[0];
		const thema2 = shuffled[1];

		this.updateAntritt(antrittId, {
			thema1Id: thema1.id,
			thema2Id: thema2.id,
			themenwahl: null // Reset choice just in case
		});
	}

	reset() {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('mrdp_antritte');
			this.antritte = [...(mockData.antritte as Antritt[])];
		}
	}
}

export const store = new MrdpStore();
