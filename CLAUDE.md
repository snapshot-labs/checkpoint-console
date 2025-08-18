# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Checkpoint Labs Console is a real-time monitoring dashboard for Checkpoint indexer infrastructure. It provides visibility into blockchain indexer synchronization status across multiple networks and GraphQL endpoints.

## Development Commands

```bash
# Install dependencies
yarn install

# Start development server (runs on http://localhost:5173)
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

## Architecture

### Core Application Flow

1. **Entry Point**: `src/main.ts` bootstraps the Vue application with router
2. **Single Route**: The app has only one route (`/`) that loads `src/views/Home.vue`
3. **Data Fetching**: Home.vue orchestrates data fetching using composables
4. **State Management**: Component-level state using Vue 3 Composition API (no Vuex/Pinia)
5. **Persistence**: Endpoint configurations saved to localStorage

### Component Structure

- **Home.vue** (`src/views/Home.vue`): Main orchestrator component
  - Manages global state and polling mechanism
  - Coordinates between child components
  - Handles persistence and initialization

- **TableHeader.vue**: Static header with column labels
- **CustomEndpointInput.vue**: Input component for adding custom endpoints
- **EndpointRow.vue**: Individual endpoint display with progress and controls
- **NetworkStatusRow.vue**: Individual network status within expanded endpoints
- **EndpointError.vue**: Error display for failed endpoint connections

### Composables

- **useBlockchainData.ts**: Handles RPC calls and GraphQL queries
  - `fetchBlockForNetwork()`: Gets current block for individual networks
  - `fetchMetadata()`: Queries GraphQL endpoint for indexer metadata
  - `getRpcUrl()`: Constructs RPC URLs for different chains

- **useUtils.ts**: Utility functions for calculations and formatting
  - `calculateIndexingSpeed()`: Computes blocks/second and ETA
  - `formatTimeEstimate()`: Human-readable time formatting
  - Sync percentage and block difference calculations

### Data Flow

1. **GraphQL Query**: Fetches `_metadatas` with `last_indexed_block` from each endpoint
2. **RPC Calls**: Gets current block heights from blockchain nodes
3. **Comparison**: Calculates blocks behind, sync percentage, and indexing speed
4. **Visualization**: Displays progress bars with color coding (green/yellow/red)

### Network Configuration

Networks are defined in `src/constants.ts`:
- Each network has: `id`, `name`, `chainId`, `indexer`, `image`, `testnet`
- Special handling for Starknet (`chainId: -1`) using Starknet.js library
- RPC URLs constructed as `https://rpc.brovider.xyz/{chainId}` or special Starknet endpoints

### Endpoint Management

Default endpoints in `src/constants.ts`:
- Production: `api.snapshot.box`, `api-1.snapshot.box`, `api-2.snapshot.box`
- Testnet: `testnet-api.snapshot.box`, `testnet-api-1.snapshot.box`, `testnet-api-2.snapshot.box`
- Delegates: `delegates-api.snapshot.box`
- Local development: `http://localhost:3000`

## Technical Constraints

- TypeScript strict mode is enabled but `noUnusedLocals` and `noUnusedParameters` are disabled
- Single `tsconfig.json` file (no separate app/node configs)
- No test framework configured
- No linting configuration
- Uses Tailwind CSS with custom Spotify-like dark theme colors

## Expected GraphQL Schema

Endpoints must support this query structure:
```graphql
query {
  _metadatas(where: { id: "last_indexed_block" }) {
    id
    value    # Block number as string
    indexer  # Network identifier (e.g., "eth", "base", "arb1")
  }
}
```

## Important Implementation Details

- **Polling**: Updates every 5 seconds when page is visible (pauses when hidden)
- **History Tracking**: Maintains 10 minutes of indexing history for speed calculations
- **Error Handling**: Shows "Error" state if endpoint fails, continues polling others
- **Expandable UI**: Endpoints start collapsed, click to expand and view networks
- **Custom Endpoints**: Users can add custom GraphQL endpoints via UI
- **Persistence**: Uses localStorage key `checkpoint-console-endpoints` for state