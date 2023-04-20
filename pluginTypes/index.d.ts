/// <amd-module name="@scom/scom-wallet-modal/interface.ts" />
declare module "@scom/scom-wallet-modal/interface.ts" {
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
/// <amd-module name="@scom/scom-wallet-modal/network.ts" />
declare module "@scom/scom-wallet-modal/network.ts" {
    import { IExtendedNetwork } from "@scom/scom-wallet-modal/interface.ts";
    export const updateNetworks: (options: any) => void;
    export const getNetworkInfo: (chainId: number) => IExtendedNetwork | undefined;
    export const getSiteSupportedNetworks: () => IExtendedNetwork[];
    export const isValidEnv: (env: string) => boolean;
    export const getInfuraId: () => string;
    export const getEnv: () => string;
}
/// <amd-module name="@scom/scom-wallet-modal/wallet.ts" />
declare module "@scom/scom-wallet-modal/wallet.ts" {
    import { IClientSideProvider } from '@ijstech/eth-wallet';
    import { IWalletPlugin } from "@scom/scom-wallet-modal/interface.ts";
    import { IWallet } from '@ijstech/eth-wallet';
    export enum WalletPlugin {
        MetaMask = "metamask",
        WalletConnect = "walletconnect"
    }
    export function initWalletPlugins(eventHandlers?: {
        [key: string]: Function;
    }): Promise<void>;
    export function connectWallet(walletPlugin: string): Promise<IWallet>;
    export const getSupportedWalletProviders: () => IClientSideProvider[];
    export const updateWallets: (options: any) => void;
    export const setWalletPluginProvider: (name: string, wallet: IWalletPlugin) => void;
    export const getWalletPluginMap: () => Record<string, IWalletPlugin>;
    export const getWalletPluginProvider: (name: string) => IClientSideProvider;
}
/// <amd-module name="@scom/scom-wallet-modal" />
declare module "@scom/scom-wallet-modal" {
    import { Module, ControlElement, Container } from '@ijstech/components';
    import { IData, INetworkConfig, IWalletPlugin } from "@scom/scom-wallet-modal/interface.ts";
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
