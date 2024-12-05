var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-wallet-modal/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
});
define("@scom/scom-wallet-modal/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_1.Styles.Theme.ThemeVars;
    exports.default = components_1.Styles.style({
        $nest: {
            '.os-modal': {
                boxSizing: 'border-box',
                $nest: {
                    '.i-modal_header': {
                        borderRadius: '10px 10px 0 0',
                        background: 'unset',
                        borderBottom: `2px solid ${Theme.divider}`,
                        padding: '1rem',
                        fontWeight: 700,
                        fontSize: '1rem'
                    },
                    '.list-view': {
                        $nest: {
                            '.list-item:hover': {
                                $nest: {
                                    '> *': {
                                        opacity: 1
                                    }
                                }
                            },
                            '.list-item': {
                                cursor: 'pointer',
                                transition: 'all .3s ease-in',
                                $nest: {
                                    '&.disabled-network-selection': {
                                        cursor: 'default',
                                        $nest: {
                                            '&:hover > *': {
                                                opacity: '0.5 !important',
                                            }
                                        }
                                    },
                                    '> *': {
                                        opacity: .5
                                    }
                                }
                            },
                            '.list-item.is-actived': {
                                $nest: {
                                    '> *': {
                                        opacity: 1
                                    },
                                    '&:after': {
                                        content: "''",
                                        top: '50%',
                                        left: 12,
                                        position: 'absolute',
                                        background: '#20bf55',
                                        borderRadius: '50%',
                                        width: 10,
                                        height: 10,
                                        transform: 'translate3d(-50%,-50%,0)'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
});
define("@scom/scom-wallet-modal/network.ts", ["require", "exports", "@scom/scom-network-list"], function (require, exports, scom_network_list_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDefaultChainId = exports.getInfuraId = exports.getSiteSupportedNetworks = exports.getNetworkInfo = exports.updateNetworks = void 0;
    const updateNetworks = (options) => {
        if (options.infuraId) {
            setInfuraId(options.infuraId);
        }
        if (options.networks) {
            setNetworkList(options.networks, options.infuraId);
        }
    };
    exports.updateNetworks = updateNetworks;
    const state = {
        networkMap: {},
        defaultChainId: 0,
        infuraId: ""
    };
    const setNetworkList = (networkList, infuraId) => {
        state.networkMap = {};
        const defaultNetworkList = (0, scom_network_list_1.default)();
        const defaultNetworkMap = defaultNetworkList.reduce((acc, cur) => {
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
                state.networkMap[networkInfo.chainId] = {
                    ...networkInfo,
                    symbol: networkInfo.nativeCurrency?.symbol || "",
                    explorerTxUrl: explorerUrl ? `${explorerUrl}${explorerUrl.endsWith("/") ? "" : "/"}tx/` : "",
                    explorerAddressUrl: explorerUrl ? `${explorerUrl}${explorerUrl.endsWith("/") ? "" : "/"}address/` : ""
                };
            }
        }
        else if (Array.isArray(networkList)) {
            const networksMap = defaultNetworkMap;
            Object.values(defaultNetworkMap).forEach(network => {
                state.networkMap[network.chainId] = { ...network, isDisabled: true };
            });
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
                };
            }
        }
    };
    const getNetworkInfo = (chainId) => {
        return state.networkMap[chainId];
    };
    exports.getNetworkInfo = getNetworkInfo;
    const getSiteSupportedNetworks = () => {
        let networkFullList = Object.values(state.networkMap);
        let list = networkFullList.filter(network => !network.isDisabled);
        return list;
    };
    exports.getSiteSupportedNetworks = getSiteSupportedNetworks;
    const setInfuraId = (infuraId) => {
        state.infuraId = infuraId;
    };
    const getInfuraId = () => {
        return state.infuraId;
    };
    exports.getInfuraId = getInfuraId;
    const getDefaultChainId = () => {
        return state.defaultChainId;
    };
    exports.getDefaultChainId = getDefaultChainId;
});
define("@scom/scom-wallet-modal/wallet.ts", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-wallet-modal/network.ts"], function (require, exports, components_2, eth_wallet_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getWalletPluginProvider = exports.getWalletPluginMap = exports.setWalletPluginProvider = exports.updateWallets = exports.getSupportedWalletProviders = exports.connectWallet = exports.initWalletPlugins = exports.WalletPlugin = void 0;
    var WalletPlugin;
    (function (WalletPlugin) {
        WalletPlugin["MetaMask"] = "metamask";
        WalletPlugin["WalletConnect"] = "walletconnect";
    })(WalletPlugin = exports.WalletPlugin || (exports.WalletPlugin = {}));
    const state = {
        wallets: [],
        walletPluginMap: {}
    };
    async function getWalletPluginConfigProvider(wallet, pluginName, packageName, events, options) {
        switch (pluginName) {
            case WalletPlugin.MetaMask:
                return new eth_wallet_1.MetaMaskProvider(wallet, events, options);
            case WalletPlugin.WalletConnect:
                return new eth_wallet_1.Web3ModalProvider(wallet, events, options);
            default: {
                if (packageName) {
                    const provider = await components_2.application.loadPackage(packageName, '*');
                    return new provider(wallet, events, options);
                }
            }
        }
    }
    async function initWalletPlugins(eventHandlers) {
        let wallet = eth_wallet_1.Wallet.getClientInstance();
        state.walletPluginMap = {};
        const events = {
            onAccountChanged: async (account) => {
                let connected = !!account;
                if (eventHandlers && eventHandlers.accountsChanged) {
                    let { requireLogin, isLoggedIn } = await eventHandlers.accountsChanged(account);
                    if (requireLogin && !isLoggedIn)
                        connected = false;
                }
                if (connected) {
                    localStorage.setItem('walletProvider', eth_wallet_1.Wallet.getClientInstance()?.clientSideProvider?.name || '');
                    document.cookie = `scom__wallet=${eth_wallet_1.Wallet.getClientInstance()?.clientSideProvider?.name || ''}`;
                }
                components_2.application.EventBus.dispatch("isWalletConnected" /* EventId.IsWalletConnected */, connected);
            },
            onChainChanged: async (chainIdHex) => {
                const chainId = Number(chainIdHex);
                if (eventHandlers && eventHandlers.chainChanged) {
                    eventHandlers.chainChanged(chainId);
                }
                components_2.application.EventBus.dispatch("chainChanged" /* EventId.chainChanged */, chainId);
            }
        };
        let networkList = (0, network_1.getSiteSupportedNetworks)();
        const rpcs = {};
        for (const network of networkList) {
            let rpc = network.rpcUrls[0];
            if (rpc)
                rpcs[network.chainId] = rpc;
        }
        for (let walletPlugin of state.wallets) {
            let pluginName = walletPlugin.name;
            let providerOptions;
            if (pluginName == WalletPlugin.WalletConnect) {
                let mainChainId = (0, network_1.getDefaultChainId)();
                let optionalChains = networkList.map((network) => network.chainId).filter((chainId) => chainId !== mainChainId);
                let walletConnectConfig = components_2.application.store?.walletConnectConfig;
                providerOptions = {
                    ...walletConnectConfig,
                    name: pluginName,
                    infuraId: (0, network_1.getInfuraId)(),
                    chains: [mainChainId],
                    optionalChains: optionalChains,
                    rpc: rpcs,
                    useDefaultProvider: true
                };
            }
            else {
                providerOptions = {
                    name: pluginName,
                    infuraId: (0, network_1.getInfuraId)(),
                    rpc: rpcs,
                    useDefaultProvider: true
                };
            }
            let provider = await getWalletPluginConfigProvider(wallet, pluginName, walletPlugin.packageName, events, providerOptions);
            (0, exports.setWalletPluginProvider)(pluginName, {
                name: pluginName,
                packageName: walletPlugin.packageName,
                provider
            });
        }
    }
    exports.initWalletPlugins = initWalletPlugins;
    async function connectWallet(walletPlugin, triggeredByUser = false) {
        // let walletProvider = localStorage.getItem('walletProvider') || '';
        let wallet = eth_wallet_1.Wallet.getClientInstance();
        if (!wallet.chainId) {
            // wallet.chainId = getDefaultChainId();
        }
        let provider = (0, exports.getWalletPluginProvider)(walletPlugin);
        if (provider?.installed()) {
            await wallet.connect(provider, {
                userTriggeredConnect: triggeredByUser
            });
        }
        return wallet;
    }
    exports.connectWallet = connectWallet;
    const getSupportedWalletProviders = () => {
        const walletPluginMap = (0, exports.getWalletPluginMap)();
        return state.wallets.map(v => walletPluginMap[v.name]?.provider || null);
    };
    exports.getSupportedWalletProviders = getSupportedWalletProviders;
    const updateWallets = (options) => {
        if (options.wallets) {
            state.wallets = options.wallets;
        }
    };
    exports.updateWallets = updateWallets;
    const setWalletPluginProvider = (name, wallet) => {
        state.walletPluginMap[name] = wallet;
    };
    exports.setWalletPluginProvider = setWalletPluginProvider;
    const getWalletPluginMap = () => {
        return state.walletPluginMap;
    };
    exports.getWalletPluginMap = getWalletPluginMap;
    const getWalletPluginProvider = (name) => {
        return state.walletPluginMap[name]?.provider;
    };
    exports.getWalletPluginProvider = getWalletPluginProvider;
});
define("@scom/scom-wallet-modal/translations.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-wallet-modal/translations.json.ts'/> 
    exports.default = {
        "en": {
            "connect_wallet": "Connect Wallet",
            "recommended_wallet_for_chrome": "Recommended wallet for Chrome"
        },
        "zh-hant": {
            "connect_wallet": "連接錢包",
            "recommended_wallet_for_chrome": "推薦的Chrome錢包"
        },
        "vi": {
            "connect_wallet": "Kết nối ví",
            "recommended_wallet_for_chrome": "Danh sách ví được khuyến khích cho Chrome"
        }
    };
});
define("@scom/scom-wallet-modal", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-wallet-modal/index.css.ts", "@scom/scom-wallet-modal/wallet.ts", "@scom/scom-wallet-modal/network.ts", "@scom/scom-wallet-modal/wallet.ts", "@scom/scom-wallet-modal/translations.json.ts"], function (require, exports, components_3, eth_wallet_2, index_css_1, wallet_1, network_2, wallet_2, translations_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_3.Styles.Theme.ThemeVars;
    let ScomWalletModal = class ScomWalletModal extends components_3.Module {
        constructor(parent, options) {
            super(parent, options);
            this.renderWalletList = async () => {
                if (!this.gridWalletList)
                    return;
                if (this.wallets?.length)
                    await (0, wallet_1.initWalletPlugins)();
                this.gridWalletList.clearInnerHTML();
                const walletList = (0, wallet_1.getSupportedWalletProviders)();
                this.walletMapper = new Map();
                walletList.forEach((wallet) => {
                    const isActive = this.isWalletActive(wallet.name);
                    if (isActive)
                        this.currActiveWallet = wallet.name;
                    const hsWallet = (this.$render("i-hstack", { class: isActive ? 'is-actived list-item' : 'list-item', verticalAlignment: 'center', gap: 12, background: { color: Theme.colors.secondary.light }, border: { radius: 10 }, position: "relative", padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }, horizontalAlignment: "space-between", onClick: () => this.onWalletSelected(wallet) },
                        this.$render("i-label", { caption: wallet.displayName, margin: { left: '1rem' }, wordBreak: "break-word", font: { size: '.875rem', bold: true, color: Theme.colors.primary.dark } }),
                        this.$render("i-image", { width: 34, height: "auto", url: wallet.image })));
                    this.walletMapper.set(wallet.name, hsWallet);
                    this.gridWalletList.append(hsWallet);
                });
            };
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get wallets() {
            return this._data.wallets;
        }
        set wallets(value) {
            this._data.wallets = value;
            (0, wallet_2.updateWallets)({ wallets: value || [] });
            this.renderWalletList();
        }
        get networks() {
            return this._data.networks;
        }
        set networks(value) {
            this._data.networks = value;
            (0, network_2.updateNetworks)({ networks: value || [] });
            this.renderWalletList();
        }
        async setData(data) {
            this._data = data;
            (0, wallet_2.updateWallets)({ wallets: data.wallets || [] });
            (0, network_2.updateNetworks)({ networks: data.networks || [] });
            await this.renderWalletList();
        }
        async getData() {
            return this._data;
        }
        showModal() {
            this.mdConnect.visible = true;
        }
        hideModal() {
            this.mdConnect.visible = false;
        }
        isWalletActive(walletPlugin) {
            let provider = (0, wallet_1.getWalletPluginProvider)(walletPlugin);
            return provider ? provider.installed() && eth_wallet_2.Wallet.getClientInstance().clientSideProvider?.name === walletPlugin : false;
        }
        onOpenModal() {
            let wallet = eth_wallet_2.Wallet.getClientInstance();
            let isConnected = wallet.isConnected;
            if (this.currActiveWallet && this.walletMapper.has(this.currActiveWallet)) {
                this.walletMapper.get(this.currActiveWallet).classList.remove('is-actived');
            }
            if (isConnected && this.walletMapper.has(wallet.clientSideProvider?.name)) {
                this.walletMapper.get(wallet.clientSideProvider?.name).classList.add('is-actived');
            }
            this.currActiveWallet = wallet.clientSideProvider?.name;
        }
        openLink(link) {
            return window.open(link, '_blank');
        }
        async onWalletSelected(wallet) {
            const provider = (0, wallet_1.getWalletPluginProvider)(wallet.name);
            if (provider?.installed())
                await (0, wallet_1.connectWallet)(wallet.name, true);
            else
                this.openLink(provider.homepage);
            this.hideModal();
            if (this.onCustomWalletSelected)
                this.onCustomWalletSelected(wallet);
        }
        init() {
            this.i18n.init({ ...translations_json_1.default });
            super.init();
            const networks = this.getAttribute('networks', true, []);
            const wallets = this.getAttribute('wallets', true, []);
            this.setData({ networks, wallets });
            this.onCustomWalletSelected = this.getAttribute('onCustomWalletSelected', true) || this.onCustomWalletSelected;
        }
        render() {
            return (this.$render("i-panel", { class: index_css_1.default },
                this.$render("i-modal", { id: 'mdConnect', title: '$connect_wallet', class: 'os-modal', width: 440, closeIcon: { name: 'times' }, border: { radius: 10 }, onOpen: this.onOpenModal.bind(this) },
                    this.$render("i-vstack", { padding: { left: '1rem', right: '1rem', bottom: '2rem' }, lineHeight: 1.5 },
                        this.$render("i-label", { font: { size: '.875rem' }, caption: '$recommended_wallet_for_chrome', margin: { top: '1rem' }, wordBreak: "break-word" }),
                        this.$render("i-panel", null,
                            this.$render("i-grid-layout", { id: 'gridWalletList', class: 'list-view', margin: { top: '0.5rem' }, columnsPerRow: 1, templateRows: ['max-content'], gap: { row: 8 } }))))));
        }
    };
    ScomWalletModal = __decorate([
        components_3.customModule,
        (0, components_3.customElements)('i-scom-wallet-modal')
    ], ScomWalletModal);
    exports.default = ScomWalletModal;
});
