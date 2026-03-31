import { describe, it, expect } from 'vitest';
import { CashPilot } from '../nodes/CashPilot/CashPilot.node';

const node = new CashPilot();
const desc = node.description;

// Helper: find the resource property
const resourceProp = desc.properties.find((p) => p.name === 'resource');
const resourceOptions = (resourceProp as any).options as Array<{
	name: string;
	value: string;
}>;

// Helper: find all operation properties and flatten their options
function getOpsForResource(resource: string) {
	const opProp = desc.properties.find(
		(p) =>
			p.name === 'operation' &&
			(p.displayOptions?.show?.resource as string[])?.includes(resource),
	);
	return (opProp as any)?.options as Array<{
		name: string;
		value: string;
		routing: { request: { method: string; url: string } };
	}>;
}

// ---------------------------------------------------------------------------
// Node metadata
// ---------------------------------------------------------------------------
describe('CashPilot node description', () => {
	it('has the correct name', () => {
		expect(desc.name).toBe('cashPilot');
	});

	it('has the correct displayName', () => {
		expect(desc.displayName).toBe('CashPilot');
	});

	it('has the correct icon', () => {
		expect(desc.icon).toBe('file:cashpilot.svg');
	});

	it('has version 1', () => {
		expect(desc.version).toBe(1);
	});
});

// ---------------------------------------------------------------------------
// Credentials
// ---------------------------------------------------------------------------
describe('CashPilot credentials', () => {
	it('requires cashPilotApi credential', () => {
		expect(desc.credentials).toBeDefined();
		expect(desc.credentials).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: 'cashPilotApi', required: true }),
			]),
		);
	});
});

// ---------------------------------------------------------------------------
// requestDefaults
// ---------------------------------------------------------------------------
describe('CashPilot requestDefaults', () => {
	it('has baseURL expression referencing credentials.url', () => {
		expect(desc.requestDefaults?.baseURL).toBe('={{$credentials.url}}');
	});

	it('has Accept and Content-Type headers', () => {
		const headers = desc.requestDefaults?.headers as Record<string, string>;
		expect(headers['Accept']).toBe('application/json');
		expect(headers['Content-Type']).toBe('application/json');
	});
});

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------
describe('CashPilot resources', () => {
	const expectedResources = [
		'compose',
		'config',
		'earnings',
		'health',
		'service',
		'worker',
	];

	it('has exactly 6 resources', () => {
		expect(resourceOptions).toHaveLength(6);
	});

	it.each(expectedResources)('includes resource "%s"', (res) => {
		expect(resourceOptions.map((o) => o.value)).toContain(res);
	});
});

// ---------------------------------------------------------------------------
// Earnings operations
// ---------------------------------------------------------------------------
describe('Earnings resource operations', () => {
	const ops = getOpsForResource('earnings');

	it('has 5 operations', () => {
		expect(ops).toHaveLength(5);
	});

	it('getSummary → GET /api/earnings/summary', () => {
		const op = ops.find((o) => o.value === 'getSummary')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe('/api/earnings/summary');
	});

	it('getBreakdown → GET /api/earnings/breakdown', () => {
		const op = ops.find((o) => o.value === 'getBreakdown')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe('/api/earnings/breakdown');
	});

	it('getDaily → GET /api/earnings/daily', () => {
		const op = ops.find((o) => o.value === 'getDaily')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe('/api/earnings/daily');
	});

	it('getHistory → GET /api/earnings/history', () => {
		const op = ops.find((o) => o.value === 'getHistory')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe('/api/earnings/history');
	});

	it('triggerCollection → POST /api/collect', () => {
		const op = ops.find((o) => o.value === 'triggerCollection')!;
		expect(op.routing.request.method).toBe('POST');
		expect(op.routing.request.url).toBe('/api/collect');
	});
});

// ---------------------------------------------------------------------------
// Service operations
// ---------------------------------------------------------------------------
describe('Service resource operations', () => {
	const ops = getOpsForResource('service');

	it('has 9 operations', () => {
		expect(ops).toHaveLength(9);
	});

	it('listDeployed → GET /api/services/deployed', () => {
		const op = ops.find((o) => o.value === 'listDeployed')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe('/api/services/deployed');
	});

	it('listAvailable → GET /api/services/available', () => {
		const op = ops.find((o) => o.value === 'listAvailable')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe('/api/services/available');
	});

	it('get → GET /api/services/{slug}', () => {
		const op = ops.find((o) => o.value === 'get')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe(
			'=/api/services/{{$parameter["slug"]}}',
		);
	});

	it('deploy → POST /api/deploy/{slug}', () => {
		const op = ops.find((o) => o.value === 'deploy')!;
		expect(op.routing.request.method).toBe('POST');
		expect(op.routing.request.url).toBe(
			'=/api/deploy/{{$parameter["slug"]}}',
		);
	});

	it('start → POST /api/services/{slug}/start', () => {
		const op = ops.find((o) => o.value === 'start')!;
		expect(op.routing.request.method).toBe('POST');
		expect(op.routing.request.url).toBe(
			'=/api/services/{{$parameter["slug"]}}/start',
		);
	});

	it('stop → POST /api/services/{slug}/stop', () => {
		const op = ops.find((o) => o.value === 'stop')!;
		expect(op.routing.request.method).toBe('POST');
		expect(op.routing.request.url).toBe(
			'=/api/services/{{$parameter["slug"]}}/stop',
		);
	});

	it('remove → DELETE /api/services/{slug}', () => {
		const op = ops.find((o) => o.value === 'remove')!;
		expect(op.routing.request.method).toBe('DELETE');
		expect(op.routing.request.url).toBe(
			'=/api/services/{{$parameter["slug"]}}',
		);
	});

	it('restart → POST /api/services/{slug}/restart', () => {
		const op = ops.find((o) => o.value === 'restart')!;
		expect(op.routing.request.method).toBe('POST');
		expect(op.routing.request.url).toBe(
			'=/api/services/{{$parameter["slug"]}}/restart',
		);
	});

	it('getLogs → GET /api/services/{slug}/logs', () => {
		const op = ops.find((o) => o.value === 'getLogs')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe(
			'=/api/services/{{$parameter["slug"]}}/logs',
		);
	});

	it('deploy has workerId param with routing.send', () => {
		const workerProp = desc.properties.find(
			(p) =>
				p.name === 'workerId' &&
				(p.displayOptions?.show?.resource as string[])?.includes('service'),
		);
		expect(workerProp).toBeDefined();
		expect((workerProp as any).routing.send.property).toBe('worker_id');
	});

	it('getLogs has lines param with routing.send', () => {
		const linesProp = desc.properties.find(
			(p) =>
				p.name === 'lines' &&
				(p.displayOptions?.show?.operation as string[])?.includes('getLogs'),
		);
		expect(linesProp).toBeDefined();
		expect((linesProp as any).routing.send.property).toBe('lines');
	});
});

// ---------------------------------------------------------------------------
// Worker operations
// ---------------------------------------------------------------------------
describe('Worker resource operations', () => {
	const ops = getOpsForResource('worker');

	it('has 4 operations', () => {
		expect(ops).toHaveLength(4);
	});

	it('list → GET /api/workers', () => {
		const op = ops.find((o) => o.value === 'list')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe('/api/workers');
	});

	it('get → GET /api/workers/{workerId}', () => {
		const op = ops.find((o) => o.value === 'get')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe(
			'=/api/workers/{{$parameter["workerId"]}}',
		);
	});

	it('remove → DELETE /api/workers/{workerId}', () => {
		const op = ops.find((o) => o.value === 'remove')!;
		expect(op.routing.request.method).toBe('DELETE');
		expect(op.routing.request.url).toBe(
			'=/api/workers/{{$parameter["workerId"]}}',
		);
	});

	it('getFleetSummary → GET /api/fleet/summary', () => {
		const op = ops.find((o) => o.value === 'getFleetSummary')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe('/api/fleet/summary');
	});
});

// ---------------------------------------------------------------------------
// Health operations
// ---------------------------------------------------------------------------
describe('Health resource operations', () => {
	const ops = getOpsForResource('health');

	it('has 2 operations', () => {
		expect(ops).toHaveLength(2);
	});

	it('getScores → GET /api/health/scores', () => {
		const op = ops.find((o) => o.value === 'getScores')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe('/api/health/scores');
	});

	it('getCollectorAlerts → GET /api/collector-alerts', () => {
		const op = ops.find((o) => o.value === 'getCollectorAlerts')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe('/api/collector-alerts');
	});
});

// ---------------------------------------------------------------------------
// Config operations
// ---------------------------------------------------------------------------
describe('Config resource operations', () => {
	const ops = getOpsForResource('config');

	it('has 2 operations', () => {
		expect(ops).toHaveLength(2);
	});

	it('get → GET /api/config', () => {
		const op = ops.find((o) => o.value === 'get')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe('/api/config');
	});

	it('update → POST /api/config', () => {
		const op = ops.find((o) => o.value === 'update')!;
		expect(op.routing.request.method).toBe('POST');
		expect(op.routing.request.url).toBe('/api/config');
	});
});

// ---------------------------------------------------------------------------
// Compose operations
// ---------------------------------------------------------------------------
describe('Compose resource operations', () => {
	const ops = getOpsForResource('compose');

	it('has 2 operations', () => {
		expect(ops).toHaveLength(2);
	});

	it('exportService → GET /api/compose/{slug}', () => {
		const op = ops.find((o) => o.value === 'exportService')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe(
			'=/api/compose/{{$parameter["slug"]}}',
		);
	});

	it('exportAll → GET /api/compose', () => {
		const op = ops.find((o) => o.value === 'exportAll')!;
		expect(op.routing.request.method).toBe('GET');
		expect(op.routing.request.url).toBe('/api/compose');
	});
});
