import { Module, customModule, Container, Button, Panel } from '@ijstech/components';
import { MetaMaskProvider, Wallet } from '@ijstech/eth-wallet';
import ScomWalletModal, { IWalletPlugin } from '@scom/scom-wallet-modal';

@customModule
export default class Module1 extends Module {
    private mainStack: Panel;
    private button: Button;
    private mdModal1: ScomWalletModal;
    private mdModal2: ScomWalletModal;
    private _wallets: IWalletPlugin[];

    constructor(parent?: Container, options?: any) {
        super(parent, options);
        let wallet: any = Wallet.getClientInstance();
        this._wallets = [
            {
                name: 'metamask',
                provider: new MetaMaskProvider(wallet)
            }
        ]
    }

    async init() {
        super.init();
        this.mdModal2 = await ScomWalletModal.create({
            wallets: this._wallets
        })
        this.mainStack.appendChild(this.mdModal2);
        this.button.onClick = () => this.mdModal2.showModal()
    }

    private onOpenModal() {
        this.mdModal1.showModal()
    }

    render() {
        return <i-vstack gap = "1rem">
            <i-hstack margin={{top: '1rem', left: '1rem'}} gap="2rem">
                <i-button
                    caption='Connect wallet'
                    font={{color: '#fff'}}
                    height={40} width={150}
                    onClick={this.onOpenModal.bind(this)}
                ></i-button>
                <i-scom-wallet-modal
                    id="mdModal1"
                    wallets={this._wallets}
                ></i-scom-wallet-modal>
            </i-hstack>
            <i-hstack id="mainStack" margin={{top: '1rem', left: '1rem'}} gap="2rem">
                <i-button
                    id="button"
                    caption='Connect wallet'
                    font={{color: '#fff'}}
                    height={40} width={150}
                ></i-button>
            </i-hstack>
        </i-vstack>
    }
}