/// <amd-module name="@scom/scom-wallet-modal/interfaces.ts" />
declare module "@scom/scom-wallet-modal/interfaces.ts" {
    import { IClientSideProvider, INetwork } from '@ijstech/eth-wallet';
    export interface IWalletPlugin {
        name: string;
        packageName?: string;
        provider?: IClientSideProvider;
    }
    export const enum EventId {
        ConnectWallet = "connectWallet",
        IsWalletConnected = "isWalletConnected",
        chainChanged = "chainChanged",
        IsWalletDisconnected = "IsWalletDisconnected",
        themeChanged = "themeChanged"
    }
    export interface INetworkConfig {
        chainName?: string;
        chainId: number;
    }
    export interface IExtendedNetwork extends INetwork {
        symbol?: string;
        env?: string;
        explorerName?: string;
        explorerTxUrl?: string;
        explorerAddressUrl?: string;
        isDisabled?: boolean;
    }
    export interface IData {
        wallets: IWalletPlugin[];
        networks?: INetworkConfig[];
    }
}
/// <amd-module name="@scom/scom-wallet-modal/index.css.ts" />
declare module "@scom/scom-wallet-modal/index.css.ts" {
    const _default: string;
    export default _default;
}
/// <amd-module name="@scom/scom-wallet-modal/model.ts" />
declare module "@scom/scom-wallet-modal/model.ts" {
    import { Wallet, IClientSideProviderEvents, IClientProviderOptions, IClientSideProvider, IWallet } from '@ijstech/eth-wallet';
    import { IExtendedNetwork, IWalletPlugin } from "@scom/scom-wallet-modal/interfaces.ts";
    export enum WalletPlugin {
        MetaMask = "metamask",
        WalletConnect = "walletconnect"
    }
    export class Model {
        private networkMap;
        private defaultChainId;
        private infuraId;
        private wallets;
        private walletPluginMap;
        updateNetworks(options: any): void;
        setNetworkList(networkList: IExtendedNetwork[] | "*", infuraId?: string): void;
        getNetworkInfo(chainId: number): IExtendedNetwork | undefined;
        getSiteSupportedNetworks(): IExtendedNetwork[];
        setInfuraId(infuraId: string): void;
        getInfuraId(): string;
        getDefaultChainId(): number;
        getWalletPluginConfigProvider(wallet: Wallet, pluginName: string, packageName?: string, events?: IClientSideProviderEvents, options?: IClientProviderOptions): Promise<any>;
        initWalletPlugins(eventHandlers?: {
            [key: string]: Function;
        }): Promise<void>;
        connectWallet(walletPlugin: string, triggeredByUser?: boolean): Promise<IWallet>;
        getSupportedWalletProviders(): IClientSideProvider[];
        updateWallets(options: any): void;
        setWalletPluginProvider(name: string, wallet: IWalletPlugin): void;
        getWalletPluginMap(): Record<string, IWalletPlugin>;
        getWalletPluginProvider(name: string): IClientSideProvider;
    }
}
/// <amd-module name="@scom/scom-wallet-modal/translations.json.ts" />
declare module "@scom/scom-wallet-modal/translations.json.ts" {
    const _default_1: {
        en: {
            connect_wallet: string;
            recommended_wallet_for_chrome: string;
        };
        "zh-hant": {
            connect_wallet: string;
            recommended_wallet_for_chrome: string;
        };
        vi: {
            connect_wallet: string;
            recommended_wallet_for_chrome: string;
        };
    };
    export default _default_1;
}
/// <amd-module name="@scom/scom-wallet-modal" />
declare module "@scom/scom-wallet-modal" {
    import { Module, ControlElement, Container } from '@ijstech/components';
    import { IData, INetworkConfig, IWalletPlugin } from "@scom/scom-wallet-modal/interfaces.ts";
    import { IClientSideProvider } from '@ijstech/eth-wallet';
    export { IWalletPlugin };
    type onSelectedCallback = (wallet: IClientSideProvider) => void;
    interface ScomWalletModalElement extends ControlElement {
        wallets: IWalletPlugin[];
        networks?: INetworkConfig[];
        onCustomWalletSelected?: onSelectedCallback;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-wallet-modal']: ScomWalletModalElement;
            }
        }
    }
    export default class ScomWalletModal extends Module {
        private walletMapper;
        private currActiveWallet;
        private _data;
        private gridWalletList;
        private mdConnect;
        private model;
        onCustomWalletSelected: onSelectedCallback;
        constructor(parent?: Container, options?: any);
        static create(options?: ScomWalletModalElement, parent?: Container): Promise<ScomWalletModal>;
        get wallets(): IWalletPlugin[];
        set wallets(value: IWalletPlugin[]);
        get networks(): INetworkConfig[];
        set networks(value: INetworkConfig[]);
        setData(data: IData): Promise<void>;
        getData(): Promise<IData>;
        showModal(): void;
        hideModal(): void;
        private isWalletActive;
        private onOpenModal;
        private openLink;
        private onWalletSelected;
        renderWalletList: () => Promise<void>;
        init(): void;
        render(): any;
    }
}
