import { Wallet, INetwork, IClientSideProviderEvents, IClientProviderOptions, MetaMaskProvider, Web3ModalProvider, IClientSideProvider, IWallet } from '@ijstech/eth-wallet';
import { EventId, IExtendedNetwork, IWalletPlugin } from './interfaces';
import getNetworkList from '@scom/scom-network-list';
import {
    application
} from '@ijstech/components';

export enum WalletPlugin {
    MetaMask = 'metamask',
    WalletConnect = 'walletconnect',
}

export class Model {
    private networkMap: { [key: number]: IExtendedNetwork } = {};
    private defaultChainId = 0;
    private infuraId = "";
    private wallets: IWalletPlugin[] = [];
    private walletPluginMap: Record<string, IWalletPlugin> = {}

    updateNetworks(options: any) {
        if (options.infuraId) {
            this.setInfuraId(options.infuraId);
        }
        if (options.networks) {
            this.setNetworkList(options.networks, options.infuraId);
        }
    };
    
    setNetworkList(networkList: IExtendedNetwork[] | "*", infuraId?: string) {
        this.networkMap = {};
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
                    if (this.infuraId && networkInfo.rpcUrls && networkInfo.rpcUrls.length > 0) {
                        for (let i = 0; i < networkInfo.rpcUrls.length; i++) {
                            networkInfo.rpcUrls[i] = networkInfo.rpcUrls[i].replace(/{InfuraId}/g, infuraId);
                        }
                    }
                }
                this.networkMap[networkInfo.chainId] = {
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
                this.networkMap[network.chainId] = { ...network, isDisabled: true };
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
                this.networkMap[network.chainId] = {
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
    
    getNetworkInfo(chainId: number): IExtendedNetwork | undefined {
        return this.networkMap[chainId];
    }
    
    getSiteSupportedNetworks() {
        let networkFullList = Object.values(this.networkMap);
        let list = networkFullList.filter(network =>
            !network.isDisabled
        );
        return list
    }
    
    setInfuraId(infuraId: string) {
        this.infuraId = infuraId;
    }
    
    getInfuraId() {
        return this.infuraId;
    }
    
    getDefaultChainId(){
        return this.defaultChainId;
    }

    async getWalletPluginConfigProvider(
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
    
    async initWalletPlugins(eventHandlers?: { [key: string]: Function }) {
        let wallet: any = Wallet.getClientInstance();
        this.walletPluginMap = {};
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
        let networkList = this.getSiteSupportedNetworks();
        const rpcs: { [chainId: number]: string } = {}
        for (const network of networkList) {
            let rpc = network.rpcUrls[0];
            if (rpc) rpcs[network.chainId] = rpc;
        }
        for (let walletPlugin of this.wallets) {
            let pluginName = walletPlugin.name;
            let providerOptions;
            if (pluginName == WalletPlugin.WalletConnect) {
                if (networkList.length === 0) continue;
                let optionalChains = networkList.map((network) => network.chainId);
                let mainChainId = networkList[0].chainId;
                let walletConnectConfig = application.store?.walletConnectConfig;
                providerOptions = {
                    ...walletConnectConfig,
                    name: pluginName,
                    infuraId: this.getInfuraId(),
                    chains: [mainChainId],
                    optionalChains: optionalChains,
                    rpc: rpcs,
                    useDefaultProvider: true
                }
            }
            else {
                providerOptions = {
                    name: pluginName,
                    infuraId: this.getInfuraId(),
                    rpc: rpcs,
                    useDefaultProvider: true
                }
            }
            let provider = walletPlugin.provider || await this.getWalletPluginConfigProvider(wallet, pluginName, walletPlugin.packageName, events, providerOptions);
            this.setWalletPluginProvider(pluginName, {
                name: pluginName,
                packageName: walletPlugin.packageName,
                provider
            });
        }
    }
    
    async connectWallet(walletPlugin: string, triggeredByUser: boolean = false): Promise<IWallet> {
        // let walletProvider = localStorage.getItem('walletProvider') || '';
        let wallet = Wallet.getClientInstance();
        if (!wallet.chainId) {
            // wallet.chainId = getDefaultChainId();
        }
        let provider = this.getWalletPluginProvider(walletPlugin);
        if (provider?.installed()) {
            await wallet.connect(provider, {
                userTriggeredConnect: triggeredByUser
            });
        }
        return wallet;
    }
    
    getSupportedWalletProviders(): IClientSideProvider[] {
        let providers: IClientSideProvider[] = [];
        const walletPluginMap = this.getWalletPluginMap();
        for (let wallet of this.wallets) {
            if (walletPluginMap[wallet.name]) {
                providers.push(walletPluginMap[wallet.name].provider);
            }
        }
        return providers;
    }
    
    updateWallets(options: any) {
        if (options.wallets) {
            this.wallets = options.wallets
        }
    }
    
    setWalletPluginProvider(name: string, wallet: IWalletPlugin) {
        this.walletPluginMap[name] = wallet;
    }
    
    getWalletPluginMap() {
        return this.walletPluginMap;
    }
    
    getWalletPluginProvider(name: string) {
        return this.walletPluginMap[name]?.provider;
    }
}