import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TopicDraw from './TopicDraw.svelte';

const mockTopics = [
	{ id: 't1', bezeichnung: 'Topic 1' },
	{ id: 't2', bezeichnung: 'Topic 2' },
	{ id: 't3', bezeichnung: 'Topic 3' }
];

describe('TopicDraw.svelte', () => {
	afterEach(cleanup);

	it('should render the draw button initially', () => {
		render(TopicDraw, {
			availableTopics: mockTopics,
			onDraw: vi.fn(),
			onSelect: vi.fn()
		});

		expect(screen.getByText(/Zwei Themengebiete ziehen/i)).toBeDefined();
	});

	it('should call onDraw when draw button is clicked', async () => {
		const onDraw = vi.fn();
		render(TopicDraw, {
			availableTopics: mockTopics,
			onDraw,
			onSelect: vi.fn()
		});

		const button = screen.getByText(/Zwei Themengebiete ziehen/i);
		await fireEvent.click(button);

		expect(onDraw).toHaveBeenCalled();
	});

	it('should show drawn topics when props are provided', () => {
		render(TopicDraw, {
			availableTopics: mockTopics,
			drawnTopic1: mockTopics[0],
			drawnTopic2: mockTopics[1],
			onDraw: vi.fn(),
			onSelect: vi.fn()
		});

		expect(screen.getByText('Topic 1')).toBeDefined();
		expect(screen.getByText('Topic 2')).toBeDefined();
		expect(screen.getByText(/Bitte wählen Sie ein Themengebiet/i)).toBeDefined();
	});

	it('should call onSelect when a topic card is clicked', async () => {
		const onSelect = vi.fn();
		render(TopicDraw, {
			availableTopics: mockTopics,
			drawnTopic1: mockTopics[0],
			drawnTopic2: mockTopics[1],
			onDraw: vi.fn(),
			onSelect
		});

		// By providing drawnTopic1 and drawnTopic2, hasDrawn becomes true.
		// canSelect is derived from hasDrawn && !selectedTopicId.
		// So buttons should be enabled.
		const topicButtons = screen.getAllByRole('button');
		const topic1Button = topicButtons.find(b => b.textContent?.includes('Topic 1'));
		if (!topic1Button) throw new Error('Topic 1 button not found');
		
		await fireEvent.click(topic1Button);
		expect(onSelect).toHaveBeenCalledWith('t1');
	});

	it('should show success message when topic is selected', () => {
		render(TopicDraw, {
			availableTopics: mockTopics,
			drawnTopic1: mockTopics[0],
			drawnTopic2: mockTopics[1],
			selectedTopicId: 't1',
			onDraw: vi.fn(),
			onSelect: vi.fn()
		});

		expect(screen.getByText(/Gewähltes Themengebiet:/i)).toBeDefined();
		expect(screen.getAllByText('Topic 1')).toHaveLength(2); // One in the list, one in the selection info
	});

	it('should call onDraw(null, null) when redraw button is clicked and confirmed', async () => {
		const onDraw = vi.fn();
		const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
		
		render(TopicDraw, {
			availableTopics: mockTopics,
			drawnTopic1: mockTopics[0],
			drawnTopic2: mockTopics[1],
			onDraw,
			onSelect: vi.fn()
		});

		const redrawButton = screen.getByText(/Themenziehung zurücksetzen/i);
		await fireEvent.click(redrawButton);

		expect(confirmSpy).toHaveBeenCalled();
		expect(onDraw).toHaveBeenCalledWith(null, null);
		
		confirmSpy.mockRestore();
	});
});
