import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { store } from './store.svelte';

export function exportAntrittePdf() {
	const doc = new jsPDF({
		orientation: 'landscape',
		unit: 'mm',
		format: 'a4'
	});

	// Group antritte by day
	const antritte = [...store.antritte].sort((a, b) => {
		const timeA = a.startVB || '';
		const timeB = b.startVB || '';
		return timeA.localeCompare(timeB);
	});

	const groups: Record<string, typeof antritte> = {};
	for (const a of antritte) {
		if (!a.startVB) continue;
		const dateStr = a.startVB.split('T')[0];
		if (!groups[dateStr]) groups[dateStr] = [];
		groups[dateStr].push(a);
	}

	const dates = Object.keys(groups).sort();

	for (let i = 0; i < dates.length; i++) {
		const dateStr = dates[i];
		if (i > 0) doc.addPage();

		const dayData = groups[dateStr];
		const dateObj = new Date(dateStr);
		const formattedDate = dateObj.toLocaleDateString('de-AT', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' });

		doc.setFontSize(14);
		doc.text(`Prüfungsplan - ${formattedDate}`, 14, 15);

		const head: any = [
			[
				{ content: 'KandidatInnen', colSpan: 3, styles: { halign: 'center', fillColor: [52, 152, 219], textColor: 255 } },
				{ content: 'Vorbereitung', colSpan: 4, styles: { halign: 'center', fillColor: [41, 128, 185], textColor: 255 } },
				{ content: 'Prüfung', colSpan: 2, styles: { halign: 'center', fillColor: [31, 97, 141], textColor: 255 } },
				{ content: 'Fach', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fillColor: [23, 165, 137], textColor: 255 } },
				{ content: 'zus. Kommissionsmitglieder', colSpan: 3, styles: { halign: 'center', fillColor: [26, 188, 156], textColor: 255 } },
				{ content: 'Note', colSpan: 3, styles: { halign: 'center', fillColor: [230, 126, 34], textColor: 255 } }
			],
			[
				'Nr.', 'Name', 'AZ\nThemen',
				'Gez.\nThemen', 'gew.\nThema', 'Aufg.\nNr.', 'Start VB',
				'Beginn', 'Ende',
				'KV/Stv.', 'PrüferIn', 'Beisitz',
				'P', 'JN', 'ZN'
			]
		];

		const body = dayData.map((a, index) => {
			const k = store.getKandidat(a.kandidatId);
			const name = k ? `${k.nachname} ${k.vorname}` : '';
			
			const f = store.getFach(a.fachId);
			const fachName = f ? f.kurzform : '';
			
			const themen = store.getThemengebieteForFach(a.fachId);
			const azThemen = themen.length;
			
			const kv = store.getKommissionsmitglied(a.kvId || '');
			const pruefer = store.getKommissionsmitglied(a.prueferId || '');
			const beisitz = store.getKommissionsmitglied(a.beisitzId || '');
			
			const kvName = kv ? kv.nachname : '';
			let prueferName = pruefer ? pruefer.nachname : '';
			// If Prüfer missing but Fach is set, sometimes there are defaults, but we use kommission table mappings
			
			const beisitzName = beisitz ? beisitz.nachname : '';
			
			const startObj = a.startVB ? new Date(a.startVB) : null;
			let startVbStr = '';
			if (startObj) {
				startVbStr = startObj.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
			}
			
			const beginnObj = a.beginn ? new Date(a.beginn) : null;
			let beginnStr = '';
			if (beginnObj) {
				beginnStr = beginnObj.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
			}

			const endeObj = a.ende ? new Date(a.ende) : null;
			let endeStr = '';
			if (endeObj) {
				endeStr = endeObj.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
			}
			
			// Show actual drawn topics if they exist, otherwise leave blank
			let gezThemen = '';
			if (a.thema1Id && a.thema2Id) {
				const t1 = store.themengebiete.find(t => String(t.id) === String(a.thema1Id));
				const t2 = store.themengebiete.find(t => String(t.id) === String(a.thema2Id));
				if (t1 && t2) gezThemen = `${t1.nr}, ${t2.nr}`;
			}
			
			let gewThema = '';
			if (a.themenwahl) {
				const choice = store.themengebiete.find(t => String(t.id) === String(a.themenwahl));
				if (choice) gewThema = choice.nr.toString();
			}

			return [
				(index + 1).toString(),
				name,
				azThemen > 0 ? azThemen.toString() : '',
				gezThemen,
				gewThema,
				a.aufgabeNr ? a.aufgabeNr.toString() : '',
				startVbStr,
				beginnStr,
				endeStr,
				fachName,
				kvName,
				prueferName,
				beisitzName,
				a.pruefungsnote ? a.pruefungsnote.toString() : '',
				a.jahresnote ? a.jahresnote.toString() : '',
				a.maturanote ? a.maturanote.toString() : ''
			];
		});

		autoTable(doc, {
			head: head,
			body: body,
			startY: 20,
			theme: 'grid',
			styles: { fontSize: 8, cellPadding: 2, textColor: [50, 50, 50], lineColor: [200, 200, 200], lineWidth: 0.1 },
			headStyles: { fillColor: [235, 245, 251], textColor: [40, 116, 166], fontStyle: 'bold' },
			alternateRowStyles: { fillColor: [249, 251, 252] },
			columnStyles: {
				0: { cellWidth: 8, halign: 'center' }, // Nr
				1: { cellWidth: 32 }, // Name
				2: { cellWidth: 15, halign: 'center' }, // AZ
				3: { cellWidth: 15, halign: 'center' }, // Gez
				4: { cellWidth: 15, halign: 'center' }, // Gew
				5: { cellWidth: 14, halign: 'center' }, // Aufg
				6: { cellWidth: 15, halign: 'center' }, // Start
				7: { cellWidth: 15, halign: 'center' }, // Beginn
				8: { cellWidth: 15, halign: 'center' }, // Ende
				9: { cellWidth: 18, halign: 'center' }, // Fach
				10: { cellWidth: 25 }, // KV
				11: { cellWidth: 25 }, // Prüf
				12: { cellWidth: 25 }, // Beisitz
				13: { cellWidth: 9, halign: 'center' }, // P
				14: { cellWidth: 9, halign: 'center' }, // JN
				15: { cellWidth: 9, halign: 'center' }  // ZN
			},
			margin: { left: 10, right: 10 }
		});
	}

	doc.save('Pruefungsplan.pdf');
}
