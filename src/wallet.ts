import {
  application
} from '@ijstech/components';
import {IClientProviderOptions, IClientSideProvider, IClientSideProviderEvents,  MetaMaskProvider, Wallet, Web3ModalProvider } from '@ijstech/eth-wallet';
import { EventId, IWalletPlugin } from './interface';
import { getInfuraId, getSiteSupportedNetworks } from './network';
import { IWallet } from '@ijstech/eth-wallet';

export enum WalletPlugin {
  MetaMask = 'metamask',
  WalletConnect = 'walletconnect',
}

const state = {
  wallets: [] as IWalletPlugin[],
  walletPluginMap: {} as Record<string, IWalletPlugin>
}

async function getWalletPluginConfigProvider(
  wallet: Wallet, 
  pluginName: string, 
  packageName?: string,
  events?: IClientSideProviderEvents, 
  options?: IClientProviderOptions
) {
  switch (pluginName) {
    case WalletPlugin.MetaMask:
      return new MetaMaskProvider(wallet, events, options);
    case WalletPlugin.WalletConnect:
      return new Web3ModalProvider(wallet, events, options);
    default: {
      if (packageName) {
        const provider: any = await application.loadPackage(packageName, '*');
        return new provider(wallet, events, options);
      }
    }
  }
} 

export async function initWalletPlugins(eventHandlers?: { [key: string]: Function }) {
  let wallet: any = Wallet.getClientInstance();
  state.walletPluginMap = {};
  const events = {
    onAccountChanged: async (account: string) => {
      let connected = !!account;
      if (eventHandlers && eventHandlers.accountsChanged) {
        let { requireLogin, isLoggedIn } = await eventHandlers.accountsChanged(account);
        if (requireLogin && !isLoggedIn) connected = false;
      }
      if (connected) {
        localStorage.setItem('walletProvider', Wallet.getClientInstance()?.clientSideProvider?.name || '');
        document.cookie = `scom__wallet=${Wallet.getClientInstance()?.clientSideProvider?.name || ''}`;
      }
      application.EventBus.dispatch(EventId.IsWalletConnected, connected);
    },
    onChainChanged: async (chainIdHex: string) => {
      const chainId = Number(chainIdHex);

      if (eventHandlers && eventHandlers.chainChanged) {
        eventHandlers.chainChanged(chainId);
      }
      application.EventBus.dispatch(EventId.chainChanged, chainId);
    }
  }
  let networkList = getSiteSupportedNetworks();
  const rpcs: { [chainId: number]: string } = {}
  for (const network of networkList) {
    let rpc = network.rpcUrls[0];
    if (rpc) rpcs[network.chainId] = rpc;
  }
  for (let walletPlugin of state.wallets) {
    let pluginName = walletPlugin.name;
    let providerOptions;
    if (pluginName == WalletPlugin.WalletConnect) {
      providerOptions = {
        name: pluginName,
        infuraId: getInfuraId(),
        bridge: "https://bridge.walletconnect.org",
        rpc: rpcs,
        useDefaultProvider: true
      }
    }
    else {
      providerOptions = {
        name: pluginName,
        infuraId: getInfuraId(),
        rpc: rpcs,
        useDefaultProvider: true
      }
    }
    let provider = await getWalletPluginConfigProvider(wallet, pluginName, walletPlugin.packageName, events, providerOptions);
    setWalletPluginProvider(pluginName, {
      name: pluginName,
      packageName: walletPlugin.packageName,
      provider
    });
  }
}

export async function connectWallet(walletPlugin: string):Promise<IWallet> {
  // let walletProvider = localStorage.getItem('walletProvider') || '';
  let wallet = Wallet.getClientInstance();
  if (!wallet.chainId) {
    // wallet.chainId = getDefaultChainId();
  }
  let provider = getWalletPluginProvider(walletPlugin);
  if (provider?.installed()) {
    await wallet.connect(provider);
  }
  return wallet;
}

export const getSupportedWalletProviders = (): IClientSideProvider[] => {
  const walletPluginMap = getWalletPluginMap();
  return state.wallets.map(v => walletPluginMap[v.name]?.provider || null);
}

export const updateWallets = (options: any) => {
  if (options.wallets) {
    state.wallets = options.wallets
  }
}

export const setWalletPluginProvider = (name: string, wallet: IWalletPlugin) => {
  state.walletPluginMap[name] = wallet;
}

export const getWalletPluginMap = () => {
  return state.walletPluginMap;
}

export const getWalletPluginProvider = (name: string) => {
  return state.walletPluginMap[name]?.provider;
}
