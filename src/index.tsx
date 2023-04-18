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
import {} from '@ijstech/eth-contract'
import { IWalletPlugin } from './interface'
import { Wallet } from '@ijstech/eth-wallet'
import customStyle from './index.css'
export { IWalletPlugin }

const Theme = Styles.Theme.ThemeVars

type onSelectedCallback = (wallet: IWalletPlugin) => void;
interface ScomWalletModalElement extends ControlElement {
  wallets: IWalletPlugin[];
  onCustomWalletSelected?: onSelectedCallback
}

declare const window: any

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
  private _wallets: IWalletPlugin[];
  private walletMapper: Map<string, HStack>;
  private currActiveWallet: string;

  private gridWalletList: GridLayout;
  private mdConnect: Modal;

  onCustomWalletSelected: onSelectedCallback;

  constructor(parent?: Container, options?: any) {
    super(parent, options)
  }

  static async create(options?: ScomWalletModalElement, parent?: Container) {
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  get wallets() {
    return this._wallets
  }
  set wallets(value: IWalletPlugin[]) {
    this._wallets = value
    this.renderWalletList()
  }

  showModal() {
    this.mdConnect.visible = true;
  }

  hideModal() {
    this.mdConnect.visible = false;
  }

  private getWalletPluginProvider(walletPlugin: string): any {
    return this.wallets.find(wallet => wallet?.provider?.name === walletPlugin)?.provider;
  }

  private isWalletActive(walletPlugin: string) {
    let provider = this.getWalletPluginProvider(walletPlugin);
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

  onWalletSelected(wallet: IWalletPlugin) {
    this.hideModal()
    if (this.onCustomWalletSelected)
      this.onCustomWalletSelected(wallet)
  }

  renderWalletList = async () => {
    if (!this.gridWalletList) return;
    this.gridWalletList.clearInnerHTML();
    this.walletMapper = new Map();
    this.wallets.forEach((wallet) => {
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
            caption={wallet.provider?.displayName}
            margin={{ left: '1rem' }}
            wordBreak="break-word"
            font={{ size: '.875rem', bold: true, color: Theme.colors.primary.dark }}
          />
          <i-image width={34} height="auto" url={wallet.provider?.image} />
        </i-hstack>
      );
      this.walletMapper.set(wallet.name, hsWallet);
      this.gridWalletList.append(hsWallet);
    })
  }

  init() {
    super.init();
    this.wallets = this.getAttribute('wallets', true, []);
    this.onCustomWalletSelected = this.getAttribute('onCustomWalletSelected', true) || this.onCustomWalletSelected;
  }

  render() {
    return (
      <i-panel class={customStyle}>
        <i-modal
          id='mdConnect'
          title='Connect Wallet'
          class='os-modal'
          width={440}
          closeIcon={{ name: 'times' }}
          border={{ radius: 10 }}
          onOpen={this.onOpenModal.bind(this)}
        >
          <i-vstack padding={{ left: '1rem', right: '1rem', bottom: '2rem' }} lineHeight={1.5}>
            <i-label
              font={{ size: '.875rem' }}
              caption='Recommended wallet for Chrome'
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
