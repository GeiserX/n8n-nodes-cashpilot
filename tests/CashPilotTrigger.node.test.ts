import { describe, it, expect, vi } from 'vitest';
import { CashPilotTrigger } from '../nodes/CashPilot/CashPilotTrigger.node';

const trigger = new CashPilotTrigger();
const desc = trigger.description;

// Helper to create a mock poll context
function createMockContext(
	params: Record<string, any>,
	staticData: Record<string, any>,
	httpResponse: any,
) {
	return {
		getNodeParameter: (name: string) => params[name],
		getWorkflowStaticData: () => staticData,
		helpers: {
			httpRequest: vi.fn().mockResolvedValue(httpResponse),
		},
		getCredentials: vi
			.fn()
			.mockResolvedValue({ url: 'http://localhost:8000', apiKey: 'test' }),
		getNode: vi.fn().mockReturnValue({ name: 'CashPilotTrigger' }),
	};
}

// ---------------------------------------------------------------------------
// Trigger node metadata
// ---------------------------------------------------------------------------
describe('CashPilotTrigger node description', () => {
	it('has the correct name', () => {
		expect(desc.name).toBe('cashPilotTrigger');
	});

	it('has the correct displayName', () => {
		expect(desc.displayName).toBe('CashPilot Trigger');
	});

	it('has polling enabled', () => {
		expect(desc.polling).toBe(true);
	});

	it('has the correct icon', () => {
		expect(desc.icon).toBe('file:cashpilot.svg');
	});

	it('has version 1', () => {
		expect(desc.version).toBe(1);
	});

	it('is in the trigger group', () => {
		expect(desc.group).toContain('trigger');
	});

	it('requires cashPilotApi credential', () => {
		expect(desc.credentials).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: 'cashPilotApi', required: true }),
			]),
		);
	});
});

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------
describe('CashPilotTrigger event types', () => {
	const eventProp = desc.properties.find((p) => p.name === 'event');
	const eventOptions = (eventProp as any).options as Array<{
		name: string;
		value: string;
	}>;

	it('has exactly 4 event types', () => {
		expect(eventOptions).toHaveLength(4);
	});

	it.each(['newEarnings', 'serviceDown', 'collectorError', 'cashoutThreshold'])(
		'includes event "%s"',
		(evt) => {
			expect(eventOptions.map((o) => o.value)).toContain(evt);
		},
	);
});

// ---------------------------------------------------------------------------
// poll method exists
// ---------------------------------------------------------------------------
describe('CashPilotTrigger poll method', () => {
	it('has a poll method', () => {
		expect(typeof trigger.poll).toBe('function');
	});
});

// ---------------------------------------------------------------------------
// poll behaviour: serviceDown
// ---------------------------------------------------------------------------
describe('poll — serviceDown event', () => {
	it('seeds state and returns null on first poll', async () => {
		const staticData: Record<string, any> = {};
		const services = [
			{ slug: 'honeygain', container_status: 'running', status: 'running' },
			{ slug: 'pawns', container_status: 'exited', status: 'exited' },
		];

		const ctx = createMockContext({ event: 'serviceDown' }, staticData, services);
		const result = await trigger.poll.call(ctx as any);

		// First poll: lastDownSlugs was undefined, so pawns is newly down
		// but since lastDownSlugs was empty set, pawns IS newly down
		expect(staticData.lastDownSlugs).toEqual(['pawns']);
		// Should return newly-down services
		expect(result).not.toBeNull();
		expect(result![0]).toHaveLength(1);
		expect(result![0][0].json.slug).toBe('pawns');
	});

	it('returns only newly-down services on subsequent polls', async () => {
		const staticData: Record<string, any> = {
			lastDownSlugs: ['pawns'],
		};

		const services = [
			{ slug: 'honeygain', container_status: 'exited', status: 'exited' },
			{ slug: 'pawns', container_status: 'exited', status: 'exited' },
			{ slug: 'earn', container_status: 'running', status: 'running' },
		];

		const ctx = createMockContext({ event: 'serviceDown' }, staticData, services);
		const result = await trigger.poll.call(ctx as any);

		// honeygain is newly down, pawns was already known
		expect(result).not.toBeNull();
		expect(result![0]).toHaveLength(1);
		expect(result![0][0].json.slug).toBe('honeygain');
		expect(staticData.lastDownSlugs).toEqual(['honeygain', 'pawns']);
	});

	it('returns null when no new services are down', async () => {
		const staticData: Record<string, any> = {
			lastDownSlugs: ['pawns'],
		};

		const services = [
			{ slug: 'honeygain', container_status: 'running', status: 'running' },
			{ slug: 'pawns', container_status: 'exited', status: 'exited' },
		];

		const ctx = createMockContext({ event: 'serviceDown' }, staticData, services);
		const result = await trigger.poll.call(ctx as any);

		expect(result).toBeNull();
	});

	it('clears recovered services from state', async () => {
		const staticData: Record<string, any> = {
			lastDownSlugs: ['honeygain', 'pawns'],
		};

		// pawns recovered, honeygain still down
		const services = [
			{ slug: 'honeygain', container_status: 'exited', status: 'exited' },
			{ slug: 'pawns', container_status: 'running', status: 'running' },
		];

		const ctx = createMockContext({ event: 'serviceDown' }, staticData, services);
		const result = await trigger.poll.call(ctx as any);

		// No newly-down services
		expect(result).toBeNull();
		// pawns removed from state since it recovered
		expect(staticData.lastDownSlugs).toEqual(['honeygain']);
	});
});

// ---------------------------------------------------------------------------
// poll behaviour: newEarnings
// ---------------------------------------------------------------------------
describe('poll — newEarnings event', () => {
	it('seeds state and returns null on first poll', async () => {
		const staticData: Record<string, any> = {};
		const earnings = [
			{ platform: 'honeygain', balance: 1.5, date: '2026-04-01' },
		];

		const ctx = createMockContext({ event: 'newEarnings' }, staticData, earnings);
		const result = await trigger.poll.call(ctx as any);

		expect(result).toBeNull();
		expect(staticData.lastEarningsFingerprint).toBeDefined();
	});

	it('returns earnings when fingerprint changes', async () => {
		const earnings = [
			{ platform: 'honeygain', balance: 1.5, date: '2026-04-01' },
		];
		const staticData: Record<string, any> = {
			lastEarningsFingerprint: 'old-fingerprint',
		};

		const ctx = createMockContext({ event: 'newEarnings' }, staticData, earnings);
		const result = await trigger.poll.call(ctx as any);

		expect(result).not.toBeNull();
		expect(result![0]).toHaveLength(1);
		expect(result![0][0].json.platform).toBe('honeygain');
	});

	it('returns null when fingerprint is unchanged', async () => {
		const earnings = [
			{ platform: 'honeygain', balance: 1.5, date: '2026-04-01' },
		];
		const fingerprint = JSON.stringify(
			earnings.map((e) => ({
				platform: e.platform,
				balance: e.balance,
				date: e.date,
			})),
		);
		const staticData: Record<string, any> = {
			lastEarningsFingerprint: fingerprint,
		};

		const ctx = createMockContext({ event: 'newEarnings' }, staticData, earnings);
		const result = await trigger.poll.call(ctx as any);

		expect(result).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// poll behaviour: cashoutThreshold
// ---------------------------------------------------------------------------
describe('poll — cashoutThreshold event', () => {
	it('seeds state and returns null when no previously eligible', async () => {
		const staticData: Record<string, any> = {};
		const breakdown = [
			{ platform: 'honeygain', cashout: { eligible: false, minimum: 20 } },
		];

		const ctx = createMockContext(
			{ event: 'cashoutThreshold' },
			staticData,
			breakdown,
		);
		const result = await trigger.poll.call(ctx as any);

		expect(result).toBeNull();
		expect(staticData.lastEligibleSlugs).toEqual([]);
	});

	it('returns newly eligible services', async () => {
		const staticData: Record<string, any> = {
			lastEligibleSlugs: [],
		};
		const breakdown = [
			{ platform: 'honeygain', cashout: { eligible: true, minimum: 20 } },
			{ platform: 'pawns', cashout: { eligible: false, minimum: 5 } },
		];

		const ctx = createMockContext(
			{ event: 'cashoutThreshold' },
			staticData,
			breakdown,
		);
		const result = await trigger.poll.call(ctx as any);

		expect(result).not.toBeNull();
		expect(result![0]).toHaveLength(1);
		expect(result![0][0].json.platform).toBe('honeygain');
		expect(staticData.lastEligibleSlugs).toEqual(['honeygain']);
	});
});

// ---------------------------------------------------------------------------
// poll behaviour: collectorError
// ---------------------------------------------------------------------------
describe('poll — collectorError event', () => {
	it('returns null when no alerts', async () => {
		const staticData: Record<string, any> = {};
		const ctx = createMockContext(
			{ event: 'collectorError' },
			staticData,
			[],
		);
		const result = await trigger.poll.call(ctx as any);

		expect(result).toBeNull();
		expect(staticData.lastAlertFingerprint).toBe('');
	});

	it('returns alerts on first occurrence', async () => {
		const staticData: Record<string, any> = {};
		const alerts = [{ service: 'honeygain', error: 'timeout' }];

		const ctx = createMockContext(
			{ event: 'collectorError' },
			staticData,
			alerts,
		);
		const result = await trigger.poll.call(ctx as any);

		expect(result).not.toBeNull();
		expect(result![0]).toHaveLength(1);
		expect(result![0][0].json.service).toBe('honeygain');
	});

	it('returns null when alerts fingerprint unchanged', async () => {
		const alerts = [{ service: 'honeygain', error: 'timeout' }];
		const staticData: Record<string, any> = {
			lastAlertFingerprint: JSON.stringify(alerts),
		};

		const ctx = createMockContext(
			{ event: 'collectorError' },
			staticData,
			alerts,
		);
		const result = await trigger.poll.call(ctx as any);

		expect(result).toBeNull();
	});
});
