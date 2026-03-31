import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
	JsonObject,
	NodeApiError,
} from 'n8n-workflow';

export class CashPilotTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CashPilot Trigger',
		name: 'cashPilotTrigger',
		icon: 'file:cashpilot.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers when CashPilot events occur',
		defaults: { name: 'CashPilot Trigger' },
		inputs: [],
		outputs: ['main'],
		polling: true,
		credentials: [
			{
				name: 'cashPilotApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: 'newEarnings',
				options: [
					{
						name: 'New Earnings Update',
						value: 'newEarnings',
						description: 'Triggers when new earnings data is collected',
					},
					{
						name: 'Service Down',
						value: 'serviceDown',
						description:
							'Triggers when a deployed service is not running',
					},
					{
						name: 'Collector Error',
						value: 'collectorError',
						description:
							'Triggers when collector errors are reported',
					},
					{
						name: 'Cashout Threshold',
						value: 'cashoutThreshold',
						description:
							'Triggers when a service has reached its cashout minimum',
					},
				],
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const event = this.getNodeParameter('event') as string;
		const credentials = await this.getCredentials('cashPilotApi');
		const baseUrl = (credentials.url as string).replace(/\/+$/, '');
		const staticData = this.getWorkflowStaticData('node');

		const makeRequest = async (path: string): Promise<IDataObject | IDataObject[]> => {
			try {
				return await this.helpers.httpRequest({
					method: 'GET',
					url: `${baseUrl}${path}`,
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						Accept: 'application/json',
					},
					json: true,
				});
			} catch (error) {
				const errObj: JsonObject = {
					message: error instanceof Error ? error.message : String(error),
				};
				throw new NodeApiError(this.getNode(), errObj, {
					message: `CashPilot API request failed: ${path}`,
				});
			}
		};

		switch (event) {
			case 'newEarnings': {
				const earnings = (await makeRequest('/api/earnings')) as IDataObject[];
				// Build a fingerprint from the current state
				const fingerprint = JSON.stringify(
					earnings.map((e) => ({
						platform: e.platform,
						balance: e.balance,
						date: e.date,
					})),
				);

				const lastFingerprint = staticData.lastEarningsFingerprint as
					| string
					| undefined;

				if (lastFingerprint === undefined) {
					// First poll — store state, don't trigger
					staticData.lastEarningsFingerprint = fingerprint;
					return null;
				}

				if (fingerprint === lastFingerprint) {
					return null;
				}

				staticData.lastEarningsFingerprint = fingerprint;
				return [
					earnings.map((e) => ({
						json: e,
					})),
				];
			}

			case 'serviceDown': {
				const services = (await makeRequest(
					'/api/services/deployed',
				)) as IDataObject[];

				const down = services.filter(
					(s) =>
						s.container_status !== 'running' && s.status !== 'running',
				);

				if (down.length === 0) {
					return null;
				}

				// Deduplicate: only fire for newly-down services
				const downSlugs = down.map((s) => s.slug as string).sort();
				const lastDownSlugs = (staticData.lastDownSlugs as string[] | undefined) || [];

				if (JSON.stringify(downSlugs) === JSON.stringify(lastDownSlugs)) {
					return null;
				}

				staticData.lastDownSlugs = downSlugs;
				return [
					down.map((s) => ({
						json: s,
					})),
				];
			}

			case 'collectorError': {
				const alerts = (await makeRequest(
					'/api/collector-alerts',
				)) as IDataObject[];

				if (!alerts || alerts.length === 0) {
					staticData.lastAlertFingerprint = '';
					return null;
				}

				const fingerprint = JSON.stringify(alerts);
				const lastFp = staticData.lastAlertFingerprint as string | undefined;

				if (fingerprint === lastFp) {
					return null;
				}

				staticData.lastAlertFingerprint = fingerprint;
				return [
					alerts.map((a) => ({
						json: a,
					})),
				];
			}

			case 'cashoutThreshold': {
				const breakdown = (await makeRequest(
					'/api/earnings/breakdown',
				)) as IDataObject[];

				const eligible = breakdown.filter((entry) => {
					const cashout = entry.cashout as IDataObject | undefined;
					return cashout && cashout.eligible === true;
				});

				if (eligible.length === 0) {
					return null;
				}

				// Only fire for newly-eligible services
				const eligibleSlugs = eligible
					.map((e) => e.platform as string)
					.sort();
				const lastEligible =
					(staticData.lastEligibleSlugs as string[] | undefined) || [];

				if (
					JSON.stringify(eligibleSlugs) === JSON.stringify(lastEligible)
				) {
					return null;
				}

				staticData.lastEligibleSlugs = eligibleSlugs;
				return [
					eligible.map((e) => ({
						json: e,
					})),
				];
			}

			default:
				return null;
		}
	}
}
