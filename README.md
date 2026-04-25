<p align="center">
  <img src="docs/images/banner.svg" alt="n8n-nodes-cashpilot banner" width="900"/>
</p>

<p align="center">
  <a href="https://codecov.io/gh/GeiserX/n8n-nodes-cashpilot"><img src="https://codecov.io/gh/GeiserX/n8n-nodes-cashpilot/graph/badge.svg" alt="codecov"></a>
</p>

# n8n-nodes-cashpilot

[n8n](https://n8n.io/) community node for **[CashPilot](https://github.com/GeiserX/CashPilot)** — a self-hosted passive income monitoring and container management dashboard.

This node lets you automate earnings tracking, service lifecycle management, fleet monitoring, and alerting directly from your n8n workflows.

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

Search for `n8n-nodes-cashpilot` in the **Community Nodes** panel inside n8n.

## Credentials

1. Open your CashPilot instance and navigate to **Settings**.
2. Copy the **API key**.
3. In n8n, create a new **CashPilot API** credential with:
   - **URL**: The base URL of your CashPilot instance (e.g. `http://192.168.1.100:8000`)
   - **API Key**: The key you copied

## Supported Operations

### CashPilot (Regular Node)

| Resource | Operation | Description |
|----------|-----------|-------------|
| **Earnings** | Get Summary | Aggregated earnings statistics |
| | Get Breakdown | Per-service earnings with cashout eligibility |
| | Get Daily | Daily earnings for charting (1-365 days) |
| | Get History | Historical earnings (week/month/year/all) |
| | Trigger Collection | Start an earnings collection run |
| **Service** | List Deployed | List all deployed services |
| | List Available | List available services from the catalog |
| | Get | Get details of a specific service |
| | Deploy | Deploy a service with environment variables |
| | Start | Start a stopped service |
| | Stop | Stop a running service |
| | Restart | Restart a service |
| | Remove | Remove a deployed service |
| | Get Logs | Retrieve container logs |
| **Worker** | List | List all registered workers |
| | Get | Get details of a specific worker |
| | Remove | Remove a registered worker |
| | Get Fleet Summary | Aggregate fleet stats across workers |
| **Health** | Get Scores | Health scores for all services (1-90 days) |
| | Get Collector Alerts | Errors from the last collection run |
| **Config** | Get | Get current configuration |
| | Update | Update configuration key-value pairs |
| **Compose** | Export Service | Export docker-compose.yml for a service |
| | Export All | Export docker-compose.yml for all services |

### CashPilot Trigger (Polling Node)

| Event | Description |
|-------|-------------|
| New Earnings Update | Fires when new earnings data is collected |
| Service Down | Fires when a deployed container stops running |
| Collector Error | Fires when collector errors are reported |
| Cashout Threshold | Fires when a service reaches its cashout minimum |

## Screenshots

![CashPilot Node](https://raw.githubusercontent.com/GeiserX/n8n-nodes-cashpilot/main/docs/screenshot.png)

## Other n8n Community Nodes by GeiserX

- [n8n-nodes-genieacs](https://github.com/GeiserX/n8n-nodes-genieacs) — TR-069 device management
- [n8n-nodes-lynxprompt](https://github.com/GeiserX/n8n-nodes-lynxprompt) — AI configuration blueprints
- [n8n-nodes-pumperly](https://github.com/GeiserX/n8n-nodes-pumperly) — Fuel and EV charging prices
- [n8n-nodes-telegram-archive](https://github.com/GeiserX/n8n-nodes-telegram-archive) — Telegram message archive
- [n8n-nodes-way-cms](https://github.com/GeiserX/n8n-nodes-way-cms) — Web archive content management


## Related Projects

| Project | Description |
|---------|-------------|
| [CashPilot](https://github.com/GeiserX/CashPilot) | Self-hosted passive income platform with web UI for setup and earnings tracking |
| [CashPilot-android](https://github.com/GeiserX/CashPilot-android) | Android monitoring agent for CashPilot passive income apps |
| [cashpilot-ha](https://github.com/GeiserX/cashpilot-ha) | Home Assistant custom integration for CashPilot passive income monitoring |
| [cashpilot-mcp](https://github.com/GeiserX/cashpilot-mcp) | MCP Server for CashPilot passive income monitoring and fleet management |

## License

[MIT](LICENSE)
