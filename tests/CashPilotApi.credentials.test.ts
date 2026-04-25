import { describe, it, expect } from 'vitest';
import { CashPilotApi } from '../credentials/CashPilotApi.credentials';

describe('CashPilotApi Credentials', () => {
	const creds = new CashPilotApi();

	it('has the correct name', () => {
		expect(creds.name).toBe('cashPilotApi');
	});

	it('has the correct displayName', () => {
		expect(creds.displayName).toBe('CashPilot API');
	});

	it('has documentationUrl', () => {
		expect(creds.documentationUrl).toBeDefined();
		expect(creds.documentationUrl).toContain('n8n-nodes-cashpilot');
	});

	it('has url property with correct defaults', () => {
		const urlProp = creds.properties.find((p) => p.name === 'url');
		expect(urlProp).toBeDefined();
		expect(urlProp!.type).toBe('string');
		expect(urlProp!.default).toBe('http://localhost:8000');
		expect(urlProp!.required).toBe(true);
	});

	it('has apiKey property with password type', () => {
		const apiKeyProp = creds.properties.find((p) => p.name === 'apiKey');
		expect(apiKeyProp).toBeDefined();
		expect(apiKeyProp!.type).toBe('string');
		expect(apiKeyProp!.typeOptions).toEqual({ password: true });
		expect(apiKeyProp!.required).toBe(true);
	});

	it('uses Bearer token authentication', () => {
		expect(creds.authenticate).toBeDefined();
		expect(creds.authenticate.type).toBe('generic');
		const headers = (creds.authenticate as any).properties.headers;
		expect(headers.Authorization).toContain('Bearer');
		expect(headers.Authorization).toContain('$credentials.apiKey');
	});

	it('has credential test request to /api/mode', () => {
		expect(creds.test).toBeDefined();
		expect(creds.test.request.url).toBe('/api/mode');
		expect(creds.test.request.method).toBe('GET');
		expect(creds.test.request.baseURL).toBe('={{$credentials.url}}');
	});
});
