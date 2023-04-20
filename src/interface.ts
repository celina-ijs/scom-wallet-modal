import {IClientSideProvider, INetwork} from '@ijstech/eth-wallet';

export interface IWalletPlugin {
  name: string;
  packageName?: string;
  provider?: IClientSideProvider;
}

export const enum EventId {
  ConnectWallet = 'connectWallet',
  IsWalletConnected = 'isWalletConnected',
  chainChanged = 'chainChanged',
  IsWalletDisconnected = "IsWalletDisconnected",
  themeChanged = "themeChanged"
};


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
