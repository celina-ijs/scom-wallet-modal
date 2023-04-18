var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-wallet-modal/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
define("@scom/scom-wallet-modal", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-wallet-modal/index.css.ts"], function (require, exports, components_2, eth_wallet_1, index_css_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_2.Styles.Theme.ThemeVars;
    let ScomWalletModal = class ScomWalletModal extends components_2.Module {
        constructor(parent, options) {
            super(parent, options);
            this.renderWalletList = async () => {
                if (!this.gridWalletList)
                    return;
                this.gridWalletList.clearInnerHTML();
                this.walletMapper = new Map();
                this.wallets.forEach((wallet) => {
                    var _a, _b;
                    const isActive = this.isWalletActive(wallet.name);
                    if (isActive)
                        this.currActiveWallet = wallet.name;
                    const hsWallet = (this.$render("i-hstack", { class: isActive ? 'is-actived list-item' : 'list-item', verticalAlignment: 'center', gap: 12, background: { color: Theme.colors.secondary.light }, border: { radius: 10 }, position: "relative", padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }, horizontalAlignment: "space-between", onClick: () => this.onWalletSelected(wallet) },
                        this.$render("i-label", { caption: (_a = wallet.provider) === null || _a === void 0 ? void 0 : _a.displayName, margin: { left: '1rem' }, wordBreak: "break-word", font: { size: '.875rem', bold: true, color: Theme.colors.primary.dark } }),
                        this.$render("i-image", { width: 34, height: "auto", url: (_b = wallet.provider) === null || _b === void 0 ? void 0 : _b.image })));
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
            return this._wallets;
        }
        set wallets(value) {
            this._wallets = value;
            this.renderWalletList();
        }
        showModal() {
            this.mdConnect.visible = true;
        }
        hideModal() {
            this.mdConnect.visible = false;
        }
        getWalletPluginProvider(walletPlugin) {
            var _a;
            return (_a = this.wallets.find(wallet => { var _a; return ((_a = wallet === null || wallet === void 0 ? void 0 : wallet.provider) === null || _a === void 0 ? void 0 : _a.name) === walletPlugin; })) === null || _a === void 0 ? void 0 : _a.provider;
        }
        isWalletActive(walletPlugin) {
            var _a;
            let provider = this.getWalletPluginProvider(walletPlugin);
            return provider ? provider.installed() && ((_a = eth_wallet_1.Wallet.getClientInstance().clientSideProvider) === null || _a === void 0 ? void 0 : _a.name) === walletPlugin : false;
        }
        onOpenModal() {
            var _a, _b, _c;
            let wallet = eth_wallet_1.Wallet.getClientInstance();
            let isConnected = wallet.isConnected;
            if (this.currActiveWallet && this.walletMapper.has(this.currActiveWallet)) {
                this.walletMapper.get(this.currActiveWallet).classList.remove('is-actived');
            }
            if (isConnected && this.walletMapper.has((_a = wallet.clientSideProvider) === null || _a === void 0 ? void 0 : _a.name)) {
                this.walletMapper.get((_b = wallet.clientSideProvider) === null || _b === void 0 ? void 0 : _b.name).classList.add('is-actived');
            }
            this.currActiveWallet = (_c = wallet.clientSideProvider) === null || _c === void 0 ? void 0 : _c.name;
        }
        onWalletSelected(wallet) {
            this.hideModal();
            if (this.onCustomWalletSelected)
                this.onCustomWalletSelected(wallet);
        }
        init() {
            super.init();
            this.wallets = this.getAttribute('wallets', true, []);
            this.onCustomWalletSelected = this.getAttribute('onCustomWalletSelected', true) || this.onCustomWalletSelected;
        }
        render() {
            return (this.$render("i-panel", { class: index_css_1.default },
                this.$render("i-modal", { id: 'mdConnect', title: 'Connect Wallet', class: 'os-modal', width: 440, closeIcon: { name: 'times' }, border: { radius: 10 }, onOpen: this.onOpenModal.bind(this) },
                    this.$render("i-vstack", { padding: { left: '1rem', right: '1rem', bottom: '2rem' }, lineHeight: 1.5 },
                        this.$render("i-label", { font: { size: '.875rem' }, caption: 'Recommended wallet for Chrome', margin: { top: '1rem' }, wordBreak: "break-word" }),
                        this.$render("i-panel", null,
                            this.$render("i-grid-layout", { id: 'gridWalletList', class: 'list-view', margin: { top: '0.5rem' }, columnsPerRow: 1, templateRows: ['max-content'], gap: { row: 8 } }))))));
        }
    };
    ScomWalletModal = __decorate([
        components_2.customModule,
        components_2.customElements('i-scom-wallet-modal')
    ], ScomWalletModal);
    exports.default = ScomWalletModal;
});
