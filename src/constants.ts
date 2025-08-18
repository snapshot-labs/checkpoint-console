import { Network } from './types';

export const UPDATE_INTERVAL_MS = 5000;

export const ENDPOINTS = [
  'https://api.snapshot.box',
  'https://api-1.snapshot.box',
  'https://api-2.snapshot.box',
  'https://testnet-api.snapshot.box',
  'https://testnet-api-1.snapshot.box',
  'https://testnet-api-2.snapshot.box',
  'https://delegates-api.snapshot.box',
  'http://localhost:3000'
];

export const NETWORKS: Network[] = [
  {
    id: 'sep',
    name: 'Sepolia',
    chainId: 11155111,
    indexer: 'sep',
    image: 'https://ipfs.snapshot.box/ipfs/bafkreid7ndxh6y2ljw2jhbisodiyrhcy2udvnwqgon5wgells3kh4si5z4',
    testnet: true
  },
  {
    id: 'curtis',
    name: 'Curtis',
    chainId: 33111,
    indexer: 'curtis',
    image: 'https://ipfs.snapshot.box/ipfs/bafkreielbgcox2jsw3g6pqulqb7pyjgx7czjt6ahnibihaij6lozoy53w4',
    testnet: true
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    chainId: 1,
    indexer: 'eth',
    image: 'https://ipfs.snapshot.box/ipfs/bafkreid7ndxh6y2ljw2jhbisodiyrhcy2udvnwqgon5wgells3kh4si5z4',
    testnet: false
  },
  {
    id: 'base',
    name: 'Base',
    chainId: 8453,
    indexer: 'base',
    image: 'https://ipfs.snapshot.box/ipfs/QmaxRoHpxZd8PqccAynherrMznMufG6sdmHZLihkECXmZv',
    testnet: false
  },
  {
    id: 'optimism',
    name: 'OP Mainnet',
    chainId: 10,
    indexer: 'oeth',
    image: 'https://ipfs.snapshot.box/ipfs/bafkreifu2remiqfpsb4hgisbwb3qxedrzpwsea7ik4el45znjcf56xf2ku',
    testnet: false
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    chainId: 42161,
    indexer: 'arb1',
    image: 'https://ipfs.snapshot.box/ipfs/bafkreic2p3zzafvz34y4tnx2kaoj6osqo66fpdo3xnagocil452y766gdq',
    testnet: false
  },
  {
    id: 'polygon',
    name: 'Polygon',
    chainId: 137,
    indexer: 'matic',
    image: 'https://ipfs.snapshot.box/ipfs/bafkreihcx4zkpfjfcs6fazjp6lcyes4pdhqx3uvnjuo5uj2dlsjopxv5am',
    testnet: false
  },
  {
    id: 'ape',
    name: 'ApeChain',
    chainId: 33139,
    indexer: 'ape',
    image: 'https://ipfs.snapshot.box/ipfs/bafkreielbgcox2jsw3g6pqulqb7pyjgx7czjt6ahnibihaij6lozoy53w4',
    testnet: false
  },
  {
    id: 'mnt',
    name: 'Mantle',
    chainId: 5000,
    indexer: 'mnt',
    image: 'https://ipfs.snapshot.box/ipfs/bafkreidkucwfn4mzo2gtydrt2wogk3je5xpugom67vhi4h4comaxxjzoz4',
    testnet: false
  },
  {
    id: 'sn',
    name: 'Starknet',
    chainId: -1,
    indexer: 'sn',
    image: 'https://ipfs.snapshot.box/ipfs/bafkreihbjafyh7eud7r6e5743esaamifcttsvbspfwcrfoc5ykodjdi67m',
    testnet: false
  },
  {
    id: 'sn-sep',
    name: 'Starknet Sepolia',
    chainId: -1,
    indexer: 'sn-sep',
    image: 'https://ipfs.snapshot.box/ipfs/bafkreihbjafyh7eud7r6e5743esaamifcttsvbspfwcrfoc5ykodjdi67m',
    testnet: true
  }
];