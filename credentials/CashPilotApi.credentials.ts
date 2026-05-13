import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CashPilotApi implements ICredentialType {
	name = 'cashPilotApi';
	displayName = 'CashPilot API';
	documentationUrl = 'https://github.com/GeiserX/n8n-nodes-cashpilot';

	properties: INodeProperties[] = [
		{
			displayName: 'URL',
			name: 'url',
			type: 'string',
			default: 'http://localhost:8080',
			placeholder: 'http://localhost:8080',
			description: 'Base URL of the CashPilot instance (no trailing slash)',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Admin API key (CASHPILOT_ADMIN_API_KEY from your CashPilot server — NOT the fleet/worker key)',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.url}}',
			url: '/api/earnings/summary',
			method: 'GET',
		},
	};
}
