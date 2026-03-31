import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class CashPilot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CashPilot',
		name: 'cashPilot',
		icon: 'file:cashpilot.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Manage passive income services, track earnings, and control containers via CashPilot',
		defaults: { name: 'CashPilot' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'cashPilotApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.url}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// ------------------------------------------------------------------
			// Resource selector
			// ------------------------------------------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Compose', value: 'compose' },
					{ name: 'Config', value: 'config' },
					{ name: 'Earnings', value: 'earnings' },
					{ name: 'Health', value: 'health' },
					{ name: 'Service', value: 'service' },
					{ name: 'Worker', value: 'worker' },
				],
				default: 'earnings',
			},

			// ==================================================================
			// EARNINGS
			// ==================================================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['earnings'] } },
				options: [
					{
						name: 'Get Summary',
						value: 'getSummary',
						description: 'Get aggregated earnings statistics',
						action: 'Get earnings summary',
						routing: {
							request: { method: 'GET', url: '/api/earnings/summary' },
						},
					},
					{
						name: 'Get Breakdown',
						value: 'getBreakdown',
						description: 'Get per-service earnings breakdown with cashout eligibility',
						action: 'Get earnings breakdown',
						routing: {
							request: { method: 'GET', url: '/api/earnings/breakdown' },
						},
					},
					{
						name: 'Get Daily',
						value: 'getDaily',
						description: 'Get daily earnings for charting',
						action: 'Get daily earnings',
						routing: {
							request: { method: 'GET', url: '/api/earnings/daily' },
							send: {
								type: 'query',
								property: 'days',
								value: '={{$parameter["days"]}}',
							},
						},
					},
					{
						name: 'Get History',
						value: 'getHistory',
						description: 'Get historical earnings for a given period',
						action: 'Get earnings history',
						routing: {
							request: { method: 'GET', url: '/api/earnings/history' },
							send: {
								type: 'query',
								property: 'period',
								value: '={{$parameter["period"]}}',
							},
						},
					},
					{
						name: 'Trigger Collection',
						value: 'triggerCollection',
						description: 'Start an earnings collection run',
						action: 'Trigger earnings collection',
						routing: {
							request: { method: 'POST', url: '/api/collect' },
						},
					},
				],
				default: 'getSummary',
			},
			{
				displayName: 'Days',
				name: 'days',
				type: 'number',
				default: 7,
				description: 'Number of days to retrieve (1-365)',
				typeOptions: { minValue: 1, maxValue: 365 },
				displayOptions: {
					show: { resource: ['earnings'], operation: ['getDaily'] },
				},
			},
			{
				displayName: 'Period',
				name: 'period',
				type: 'options',
				default: 'week',
				options: [
					{ name: 'Week', value: 'week' },
					{ name: 'Month', value: 'month' },
					{ name: 'Year', value: 'year' },
					{ name: 'All', value: 'all' },
				],
				displayOptions: {
					show: { resource: ['earnings'], operation: ['getHistory'] },
				},
			},

			// ==================================================================
			// SERVICE
			// ==================================================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['service'] } },
				options: [
					{
						name: 'List Deployed',
						value: 'listDeployed',
						description: 'List all deployed services',
						action: 'List deployed services',
						routing: {
							request: { method: 'GET', url: '/api/services/deployed' },
						},
					},
					{
						name: 'List Available',
						value: 'listAvailable',
						description: 'List all available services from the catalog',
						action: 'List available services',
						routing: {
							request: { method: 'GET', url: '/api/services/available' },
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get details of a specific service',
						action: 'Get a service',
						routing: {
							request: {
								method: 'GET',
								url: '=/api/services/{{$parameter["slug"]}}',
							},
						},
					},
					{
						name: 'Deploy',
						value: 'deploy',
						description: 'Deploy a service',
						action: 'Deploy a service',
						routing: {
							request: {
								method: 'POST',
								url: '=/api/deploy/{{$parameter["slug"]}}',
							},
							send: {
								type: 'body',
								value: '={{JSON.parse($parameter["deployBody"] || "{}")}}',
							},
						},
					},
					{
						name: 'Start',
						value: 'start',
						description: 'Start a stopped service',
						action: 'Start a service',
						routing: {
							request: {
								method: 'POST',
								url: '=/api/services/{{$parameter["slug"]}}/start',
							},
						},
					},
					{
						name: 'Stop',
						value: 'stop',
						description: 'Stop a running service',
						action: 'Stop a service',
						routing: {
							request: {
								method: 'POST',
								url: '=/api/services/{{$parameter["slug"]}}/stop',
							},
						},
					},
					{
						name: 'Restart',
						value: 'restart',
						description: 'Restart a service',
						action: 'Restart a service',
						routing: {
							request: {
								method: 'POST',
								url: '=/api/services/{{$parameter["slug"]}}/restart',
							},
						},
					},
					{
						name: 'Remove',
						value: 'remove',
						description: 'Remove a deployed service',
						action: 'Remove a service',
						routing: {
							request: {
								method: 'DELETE',
								url: '=/api/services/{{$parameter["slug"]}}',
							},
						},
					},
					{
						name: 'Get Logs',
						value: 'getLogs',
						description: 'Get container logs for a service',
						action: 'Get service logs',
						routing: {
							request: {
								method: 'GET',
								url: '=/api/services/{{$parameter["slug"]}}/logs',
							},
						},
					},
				],
				default: 'listDeployed',
			},
			{
				displayName: 'Service Slug',
				name: 'slug',
				type: 'string',
				default: '',
				required: true,
				description: 'The unique slug identifier of the service',
				displayOptions: {
					show: {
						resource: ['service'],
						operation: [
							'get',
							'deploy',
							'start',
							'stop',
							'restart',
							'remove',
							'getLogs',
						],
					},
				},
			},
			{
				displayName: 'Deploy Body (JSON)',
				name: 'deployBody',
				type: 'json',
				default: '{}',
				description:
					'JSON body for deploy. Can include "env" (object), "hostname" (string).',
				displayOptions: {
					show: { resource: ['service'], operation: ['deploy'] },
				},
			},
			{
				displayName: 'Worker ID',
				name: 'workerId',
				type: 'number',
				default: 0,
				description:
					'Optional worker ID to target. Leave 0 for default worker.',
				displayOptions: {
					show: {
						resource: ['service'],
						operation: ['deploy', 'start', 'stop', 'restart', 'remove', 'getLogs'],
					},
				},
			},
			{
				displayName: 'Lines',
				name: 'lines',
				type: 'number',
				default: 50,
				description: 'Number of log lines to retrieve',
				typeOptions: { minValue: 1, maxValue: 10000 },
				displayOptions: {
					show: { resource: ['service'], operation: ['getLogs'] },
				},
			},

			// ==================================================================
			// WORKER
			// ==================================================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['worker'] } },
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all registered workers',
						action: 'List workers',
						routing: {
							request: { method: 'GET', url: '/api/workers' },
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get details of a specific worker',
						action: 'Get a worker',
						routing: {
							request: {
								method: 'GET',
								url: '=/api/workers/{{$parameter["workerId"]}}',
							},
						},
					},
					{
						name: 'Remove',
						value: 'remove',
						description: 'Remove a registered worker',
						action: 'Remove a worker',
						routing: {
							request: {
								method: 'DELETE',
								url: '=/api/workers/{{$parameter["workerId"]}}',
							},
						},
					},
					{
						name: 'Get Fleet Summary',
						value: 'getFleetSummary',
						description: 'Get aggregate fleet stats across all workers',
						action: 'Get fleet summary',
						routing: {
							request: { method: 'GET', url: '/api/fleet/summary' },
						},
					},
				],
				default: 'list',
			},
			{
				displayName: 'Worker ID',
				name: 'workerId',
				type: 'number',
				default: 0,
				required: true,
				description: 'The numeric ID of the worker',
				displayOptions: {
					show: {
						resource: ['worker'],
						operation: ['get', 'remove'],
					},
				},
			},

			// ==================================================================
			// HEALTH
			// ==================================================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['health'] } },
				options: [
					{
						name: 'Get Scores',
						value: 'getScores',
						description: 'Get health scores for all services',
						action: 'Get health scores',
						routing: {
							request: { method: 'GET', url: '/api/health/scores' },
							send: {
								type: 'query',
								property: 'days',
								value: '={{$parameter["healthDays"]}}',
							},
						},
					},
					{
						name: 'Get Collector Alerts',
						value: 'getCollectorAlerts',
						description: 'Get collector errors from the last collection run',
						action: 'Get collector alerts',
						routing: {
							request: { method: 'GET', url: '/api/collector-alerts' },
						},
					},
				],
				default: 'getScores',
			},
			{
				displayName: 'Days',
				name: 'healthDays',
				type: 'number',
				default: 7,
				description: 'Number of days for health score window (1-90)',
				typeOptions: { minValue: 1, maxValue: 90 },
				displayOptions: {
					show: { resource: ['health'], operation: ['getScores'] },
				},
			},

			// ==================================================================
			// CONFIG
			// ==================================================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['config'] } },
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get current configuration',
						action: 'Get config',
						routing: {
							request: { method: 'GET', url: '/api/config' },
						},
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update configuration values',
						action: 'Update config',
						routing: {
							request: {
								method: 'POST',
								url: '/api/config',
							},
							send: {
								type: 'body',
								value: '={{{"data": JSON.parse($parameter["configData"])}}}',
							},
						},
					},
				],
				default: 'get',
			},
			{
				displayName: 'Config Data (JSON)',
				name: 'configData',
				type: 'json',
				default: '{}',
				description:
					'JSON object of key-value pairs to set in the configuration',
				displayOptions: {
					show: { resource: ['config'], operation: ['update'] },
				},
			},

			// ==================================================================
			// COMPOSE
			// ==================================================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['compose'] } },
				options: [
					{
						name: 'Export Service',
						value: 'exportService',
						description: 'Export docker-compose.yml for a single service',
						action: 'Export service compose',
						routing: {
							request: {
								method: 'GET',
								url: '=/api/compose/{{$parameter["slug"]}}',
							},
						},
					},
					{
						name: 'Export All',
						value: 'exportAll',
						description:
							'Export a docker-compose.yml for all services with Docker images',
						action: 'Export all compose',
						routing: {
							request: { method: 'GET', url: '/api/compose' },
						},
					},
				],
				default: 'exportService',
			},
			{
				displayName: 'Service Slug',
				name: 'slug',
				type: 'string',
				default: '',
				required: true,
				description: 'The unique slug identifier of the service',
				displayOptions: {
					show: { resource: ['compose'], operation: ['exportService'] },
				},
			},
		],
	};
}
