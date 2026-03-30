import { RpcProvider } from 'starknet';
import { Metadata, Network } from '../types';

export function useBlockchainData() {
  const getRpcUrl = (chainId: number, isTestnet: boolean) => {
    if (chainId === -1) {
      return isTestnet
        ? 'https://rpc.brovider.xyz/sn-sep'
        : 'https://rpc.brovider.xyz/sn';
    }
    return `https://rpc.brovider.xyz/${chainId}`;
  };

  const fetchBlockForNetwork = async (network: Network, isTestnet: boolean) => {
    try {
      if (network.chainId === -1) {
        const provider = new RpcProvider({
          nodeUrl: getRpcUrl(network.chainId, isTestnet)
        });
        const block = await provider.getBlockNumber();
        return {
          networkId: network.id,
          block: parseInt(`0x${block.toString(16)}`, 16)
        };
      }
      const response = await fetch(getRpcUrl(network.chainId, isTestnet), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      }).then(res => res.json());
      return { networkId: network.id, block: parseInt(response.result, 16) };
    } catch (error) {
      console.error(`Error fetching current block for ${network.name}:`, error);
      return { networkId: network.id, block: 0 };
    }
  };

  const fetchMetadata = async (endpoint: string): Promise<Metadata[]> => {
    const response = await fetch(`${endpoint}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query {
            _metadatas(where: { id: "last_indexed_block" }) {
              id
              value
              indexer
            }
          }
        `
      })
    }).then(res => res.json());

    return response.data._metadatas;
  };

  return {
    getRpcUrl,
    fetchBlockForNetwork,
    fetchMetadata
  };
}
