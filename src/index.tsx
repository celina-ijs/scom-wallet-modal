import {
    customElements,
    Module,
    ControlElement,
    Modal,
    Container,
    Styles,
    GridLayout,
    HStack,
    customModule
} from '@ijstech/components'
import { } from '@ijstech/eth-contract'
import { IData, INetworkConfig, IWalletPlugin } from './interfaces'
import { IClientSideProvider, Wallet } from '@ijstech/eth-wallet'
import customStyle from './index.css'
import { Model } from './model'
import translations from './translations.json'

export { IWalletPlugin }

const Theme = Styles.Theme.ThemeVars

type onSelectedCallback = (wallet: IClientSideProvider) => void;
interface ScomWalletModalElement extends ControlElement {
    wallets: IWalletPlugin[];
    networks?: INetworkConfig[];
    onCustomWalletSelected?: onSelectedCallback
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-wallet-modal']: ScomWalletModalElement
        }
    }
}

@customModule
@customElements('i-scom-wallet-modal')
export default class ScomWalletModal extends Module {
    private walletMapper: Map<string, HStack>;
    private currActiveWallet: string;
    private _data: IData;

    private gridWalletList: GridLayout;
    private mdConnect: Modal;
    private model: Model;

    onCustomWalletSelected: onSelectedCallback;

    constructor(parent?: Container, options?: any) {
        super(parent, options)
        this.deferReadyCallback = true;
        this.model = new Model();
    }

    static async create(options?: ScomWalletModalElement, parent?: Container) {
        let self = new this(parent, options);
        await self.ready();
        return self;
    }

    get wallets() {
        return this._data.wallets
    }
    set wallets(value: IWalletPlugin[]) {
        this._data.wallets = value
        this.model.updateWallets({ wallets: value || [] })
        this.renderWalletList();
    }

    get networks() {
        return this._data.networks
    }
    set networks(value: INetworkConfig[]) {
        this._data.networks = value
        this.model.updateNetworks({ networks: value || [] })
        this.renderWalletList();
    }

    async setData(data: IData) {
        this._data = data;
        this.model.updateWallets({ wallets: data.wallets || [] })
        this.model.updateNetworks({ networks: data.networks || [] })
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

    private isWalletActive(walletPlugin: string) {
        let provider = this.model.getWalletPluginProvider(walletPlugin);
        return provider ? provider.installed() && Wallet.getClientInstance().clientSideProvider?.name === walletPlugin : false;
    }

    private onOpenModal() {
        let wallet = Wallet.getClientInstance();
        let isConnected = wallet.isConnected;
        if (this.currActiveWallet && this.walletMapper.has(this.currActiveWallet)) {
            this.walletMapper.get(this.currActiveWallet).classList.remove('is-actived');
        }
        if (isConnected && this.walletMapper.has(wallet.clientSideProvider?.name)) {
            this.walletMapper.get(wallet.clientSideProvider?.name).classList.add('is-actived');
        }
        this.currActiveWallet = wallet.clientSideProvider?.name;
    }

    private openLink(link: any) {
        return window.open(link, '_blank');
    }

    private async onWalletSelected(wallet: IClientSideProvider) {
        const provider = this.model.getWalletPluginProvider(wallet.name);
        if (provider?.installed())
            await this.model.connectWallet(wallet.name, true);
        else
            this.openLink(provider.homepage);
        this.hideModal()
        if (this.onCustomWalletSelected)
            this.onCustomWalletSelected(wallet)
    }

    renderWalletList = async () => {
        if (!this.gridWalletList) return;
        if (this.wallets?.length) await this.model.initWalletPlugins();
        this.gridWalletList.clearInnerHTML();
        const walletList = this.model.getSupportedWalletProviders();
        this.walletMapper = new Map();
        walletList.forEach((wallet) => {
            const isActive = this.isWalletActive(wallet.name);
            if (isActive) this.currActiveWallet = wallet.name;
            const hsWallet = (
                <i-hstack
                    class={isActive ? 'is-actived list-item' : 'list-item'}
                    verticalAlignment='center'
                    gap={12}
                    background={{ color: Theme.colors.secondary.light }}
                    border={{ radius: 10 }} position="relative"
                    padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
                    horizontalAlignment="space-between"
                    onClick={() => this.onWalletSelected(wallet)}
                >
                    <i-label
                        caption={wallet.displayName}
                        margin={{ left: '1rem' }}
                        wordBreak="break-word"
                        font={{ size: '.875rem', bold: true, color: Theme.colors.primary.dark }}
                    />
                    <i-image width={34} height="auto" url={wallet.image} />
                </i-hstack>
            );
            this.walletMapper.set(wallet.name, hsWallet);
            this.gridWalletList.append(hsWallet);
        })
    }

    async init() {
        this.i18n.init({ ...translations });
        super.init();
        const networks = this.getAttribute('networks', true, []);
        const wallets = this.getAttribute('wallets', true, []);
        await this.setData({ networks, wallets })
        this.onCustomWalletSelected = this.getAttribute('onCustomWalletSelected', true) || this.onCustomWalletSelected;
        this.executeReadyCallback();
    }

    render() {
        return (
            <i-panel class={customStyle}>
                <i-modal
                    id='mdConnect'
                    title='$connect_wallet'
                    class='os-modal'
                    width={440}
                    closeIcon={{ name: 'times' }}
                    border={{ radius: 10 }}
                    onOpen={this.onOpenModal.bind(this)}
                >
                    <i-vstack padding={{ left: '1rem', right: '1rem', bottom: '2rem' }} lineHeight={1.5}>
                        <i-label
                            font={{ size: '.875rem' }}
                            caption='$recommended_wallet_for_chrome'
                            margin={{ top: '1rem' }}
                            wordBreak="break-word"
                        ></i-label>
                        <i-panel>
                            <i-grid-layout
                                id='gridWalletList'
                                class='list-view'
                                margin={{ top: '0.5rem' }}
                                columnsPerRow={1}
                                templateRows={['max-content']}
                                gap={{ row: 8 }}
                            >
                            </i-grid-layout>
                        </i-panel>
                    </i-vstack>
                </i-modal>
            </i-panel>
        )
    }
}
