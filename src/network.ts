import { Wallet, INetwork } from '@ijstech/eth-wallet';
import { IExtendedNetwork } from './interface';
import getNetworkList from '@scom/scom-network-list';

export const updateNetworks = (options: any) => {
  if (options.infuraId) {
    setInfuraId(options.infuraId);
  }
  if (options.networks) {
    setNetworkList(options.networks, options.infuraId);
  }
};

const state = {
  networkMap: {} as { [key: number]: IExtendedNetwork },
  defaultChainId: 0,
  infuraId: ""
}

const setNetworkList = (networkList: IExtendedNetwork[] | "*", infuraId?: string) => {
  state.networkMap = {};
  const defaultNetworkList: INetwork[] = getNetworkList();
  const defaultNetworkMap: Record<number, INetwork> = defaultNetworkList.reduce((acc, cur) => {
    acc[cur.chainId] = cur;
    return acc;
  }, {});
  if (networkList === "*") {
    const networksMap = defaultNetworkMap;
    for (const chainId in networksMap) {
      const networkInfo = networksMap[chainId];
      let explorerUrl = '';
      if (networkInfo) {
        explorerUrl = networkInfo.blockExplorerUrls && networkInfo.blockExplorerUrls.length ? networkInfo.blockExplorerUrls[0] : "";
        if (state.infuraId && networkInfo.rpcUrls && networkInfo.rpcUrls.length > 0) {
          for (let i = 0; i < networkInfo.rpcUrls.length; i++) {
            networkInfo.rpcUrls[i] = networkInfo.rpcUrls[i].replace(/{InfuraId}/g, infuraId);
          }
        }
      }
      state.networkMap[networkInfo.chainId] =  {
        ...networkInfo,
        symbol: networkInfo.nativeCurrency?.symbol || "",
        explorerTxUrl: explorerUrl ? `${explorerUrl}${explorerUrl.endsWith("/") ? "" : "/"}tx/` : "",
        explorerAddressUrl: explorerUrl ? `${explorerUrl}${explorerUrl.endsWith("/") ? "" : "/"}address/` : ""
      }
    }
  }
  else if (Array.isArray(networkList)) {
    const networksMap = defaultNetworkMap;
    Object.values(defaultNetworkMap).forEach(network => {
      state.networkMap[network.chainId] = { ...network, isDisabled: true };
    })
    for (let network of networkList) {
      const networkInfo = networksMap[network.chainId];
      let explorerUrl = '';
      if (networkInfo) {
        explorerUrl = networkInfo.blockExplorerUrls && networkInfo.blockExplorerUrls.length ? networkInfo.blockExplorerUrls[0] : "";
        if (infuraId && network.rpcUrls && network.rpcUrls.length > 0) {
          for (let i = 0; i < network.rpcUrls.length; i++) {
            networkInfo.rpcUrls[i] = network.rpcUrls[i].replace(/{InfuraId}/g, infuraId);
          }
        }
      }
      state.networkMap[network.chainId] = {
        ...networkInfo,
        ...network,
        symbol: networkInfo.nativeCurrency?.symbol || "",
        explorerTxUrl: explorerUrl ? `${explorerUrl}${explorerUrl.endsWith("/") ? "" : "/"}tx/` : "",
        explorerAddressUrl: explorerUrl ? `${explorerUrl}${explorerUrl.endsWith("/") ? "" : "/"}address/` : "",
        isDisabled: false
      }
    }
  }
}

export const getNetworkInfo = (chainId: number): IExtendedNetwork | undefined => {
  return state.networkMap[chainId];
}

export const getSiteSupportedNetworks = () => {
  let networkFullList = Object.values(state.networkMap);
  let list = networkFullList.filter(network =>
    !network.isDisabled
  );
  return list
}

const setInfuraId = (infuraId: string) => {
  state.infuraId = infuraId;
}

export const getInfuraId = () => {
  return state.infuraId;
}