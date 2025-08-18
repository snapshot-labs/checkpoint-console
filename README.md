# Checkpoint Labs Console

A real-time monitoring dashboard for Checkpoint indexer infrastructure. This console provides visibility into the synchronization status of blockchain indexers across multiple networks and endpoints.

## Overview

Checkpoint Console is a web-based monitoring tool that tracks the indexing progress of various blockchain networks. It compares indexed blocks against current chain heights to show synchronization status, speed, and estimated time to completion.

## Key Features

### Network Monitoring
- **Multi-chain Support**: Monitor Ethereum, Base, Optimism, Arbitrum, Polygon, Starknet, and other networks
- **Real-time Updates**: Automatic refresh every 5 seconds with live block synchronization data
- **Testnet & Mainnet**: Separate tracking for production and test networks

### Endpoint Management
- **Multiple Endpoints**: Monitor several Checkpoint API endpoints simultaneously
- **Custom Endpoints**: Add your own GraphQL endpoints for monitoring
- **Persistent Configuration**: Endpoint preferences saved in browser localStorage
- **Expandable Views**: Click endpoints to view detailed network-by-network status

### Visual Indicators
- **Progress Bars**: Visual representation of sync progress for each network
- **Color Coding**: 
  - Green: Fully synchronized
  - Yellow: Slightly behind (< 100 blocks)
  - Red: Significantly behind (> 100 blocks)
- **Sync Metrics**: Displays blocks behind, sync percentage, and estimated time to sync

## Technical Architecture

### Frontend Stack
- **Vue 3**: Modern reactive framework with Composition API
- **TypeScript**: Type-safe development
- **Vite**: Fast build tooling and HMR
- **Tailwind CSS**: Utility-first styling

### Data Sources
- **GraphQL APIs**: Queries Checkpoint indexer metadata
- **RPC Providers**: Fetches current block heights from blockchain nodes
- **Starknet.js**: Special handling for Starknet network interactions

## Getting Started

### Prerequisites
- Node.js 16+ 
- Yarn

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd console

# Install dependencies
yarn install
```

### Development

```bash
# Start development server with hot reload
yarn dev

# The console will be available at http://localhost:5173
```

### Production Build

```bash
# Build optimized production bundle
yarn build

# Preview production build locally
yarn preview
```

## Usage

1. **View Default Endpoints**: The console starts with pre-configured Snapshot API endpoints
2. **Add Custom Endpoint**: Click "Add custom endpoint..." and enter your GraphQL endpoint URL
3. **Monitor Status**: Click on any endpoint to expand and view detailed network synchronization
4. **Track Progress**: Watch real-time updates showing:
   - Current vs indexed block numbers
   - Number of blocks behind
   - Synchronization percentage
   - Estimated time to catch up

## API Endpoints

The console expects GraphQL endpoints that support the following query:

```graphql
query {
  _metadatas(where: { id: "last_indexed_block" }) {
    id
    value
    indexer
  }
}
```

## Network Configuration

Networks are identified by their indexer names:
- `eth`: Ethereum Mainnet
- `sep`: Sepolia Testnet
- `base`: Base Network
- `oeth`: Optimism
- `arb1`: Arbitrum One
- `matic`: Polygon
- `sn`: Starknet Mainnet
- And more...

## Contributing

This is an internal monitoring tool for Checkpoint Labs infrastructure. For questions or issues, please contact the development team.

## License

MIT - see [LICENSE](LICENSE) file for details