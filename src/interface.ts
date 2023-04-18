import {IClientSideProvider} from '@ijstech/eth-wallet';

export interface IWalletPlugin {
  name: string;
  packageName?: string;
  provider: IClientSideProvider;
}
