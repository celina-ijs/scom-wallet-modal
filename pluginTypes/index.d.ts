/// <amd-module name="@scom/scom-wallet-modal/interface.ts" />
declare module "@scom/scom-wallet-modal/interface.ts" {
    import { IClientSideProvider } from '@ijstech/eth-wallet';
    export interface IWalletPlugin {
        name: string;
        packageName?: string;
        provider: IClientSideProvider;
    }
}
/// <amd-module name="@scom/scom-wallet-modal/index.css.ts" />
declare module "@scom/scom-wallet-modal/index.css.ts" {
    const _default: string;
    export default _default;
}
/// <amd-module name="@scom/scom-wallet-modal" />
declare module "@scom/scom-wallet-modal" {
    import { Module, ControlElement, Container } from '@ijstech/components';
    import { IWalletPlugin } from "@scom/scom-wallet-modal/interface.ts";
    export { IWalletPlugin };
    type onSelectedCallback = (wallet: IWalletPlugin) => void;
    interface ScomWalletModalElement extends ControlElement {
        wallets: IWalletPlugin[];
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
        private _wallets;
        private walletMapper;
        private currActiveWallet;
        private gridWalletList;
        private mdConnect;
        onCustomWalletSelected: onSelectedCallback;
        constructor(parent?: Container, options?: any);
        static create(options?: ScomWalletModalElement, parent?: Container): Promise<ScomWalletModal>;
        get wallets(): IWalletPlugin[];
        set wallets(value: IWalletPlugin[]);
        showModal(): void;
        hideModal(): void;
        private getWalletPluginProvider;
        private isWalletActive;
        private onOpenModal;
        onWalletSelected(wallet: IWalletPlugin): void;
        renderWalletList: () => Promise<void>;
        init(): void;
        render(): any;
    }
}
