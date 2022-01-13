import StarMaskOnboarding from '@starcoin/starmask-onboarding'
import { providers, utils, bcs, encoding, version as starcoinVersion } from '@starcoin/starcoin'
import Vue from './vue.min.js';

new Vue({
  el: ".land8",
  data: {
    land8: [
      {
        owner: '0xf7ea75c717892e5dfce5844ce4271dd6',
        price: 0,
        message: 'hello land8',
        bkcolor: '#223567'
      }, { owner: '0x125ffbe331db6fbf49ee0e62f22321a3' }, {}, {}, {}, {}, {}, {}
    ],
    accounts: [],
    nodeUrlMap: {
      '1': 'https://main-seed.starcoin.org',
      '2': 'https://proxima-seed.starcoin.org',
      '251': 'https://barnard-seed.starcoin.org',
      '253': 'https://halley-seed.starcoin.org',
      '254': 'http://localhost:9850',
    },
    landchecks: [],
    testtype: 'balances',
    testinput: 0,
  },
  computed: {
    isOwner(){
      if (this.landchecks.length && this.accounts.length) {
        let taccount = this.accounts[0]
        for (let idx of this.landchecks) {
          if (this.land8[idx].owner !== taccount) {
            return false
          }
        }
        return true
      }
      return false
    }
  },
  mounted(){
    this.eInit()
  },
  methods: {
    async eInit() {
      const { isStarMaskInstalled } = StarMaskOnboarding
      const currentUrl = new URL(window.location.href)
      const forwarderOrigin = currentUrl.hostname === 'localhost'
        ? 'http://localhost:9032'
        : undefined

      let onboarding

      try {
        onboarding = new StarMaskOnboarding({ forwarderOrigin })
      } catch (error) {
        console.error(error)
      }

      if (!isStarMaskInstalled()) {
        onboardButton.innerText = 'Click here to install StarMask!'
        onboardButton.onclick = () => {
          onboardButton.innerText = 'Onboarding in progress'
          onboardButton.disabled = true
          onboarding.startOnboarding()
        }
        onboardButton.disabled = false
      } else if (this.isStarMaskConnected()) {
        onboardButton.innerText = 'Connected'
        onboardButton.disabled = true
        if (onboarding) {
          onboarding.stopOnboarding()
        }
      } else {
        onboardButton.innerText = 'Connect'
        onboardButton.onclick = this.onClickConnect
        onboardButton.disabled = false
      }

      const accountButtonsDisabled = !isStarMaskInstalled() || !this.isStarMaskConnected()
      console.log('is accountButtons Disabled', accountButtonsDisabled)

      if (window.starcoin) {
        window.starcoin.on('accountsChanged', this.handleNewAccounts)
        window.starcoin.on('chainChanged', this.handleNewChain)
        window.starcoin.on('networkChanged', this.handleNewNetwork)
      }
    },
    async onClickConnect() {
      try {
        const newAccounts = await window.starcoin.request({
          method: 'stc_requestAccounts',
        })
        this.handleNewAccounts(newAccounts)
      } catch (error) {
        console.error(error)
      }
    },
    isStarMaskConnected() {
      return this.accounts && this.accounts.length > 0
    },
    handleNewChain(chainId){
      console.debug('chainId', chainId)
      this.provider = new providers.JsonRpcProvider(this.nodeUrlMap[chainId])
    },
    handleNewNetwork(networkid) {
      console.debug('networkid', networkid)
    },
    handleNewAccounts(accounts) {
      console.debug('new accounts', accounts)
      this.accounts = accounts
      this.eInit()
    },
    async getNetworkAndChainId() {
      try {
        const chainInfo = await window.starcoin.request({
          method: 'chain.id',
        })
        console.debug(chainInfo.id, `0x${ chainInfo.id.toString(16) }`)
        this.handleNewChain(chainInfo.id)
      } catch (err) {
        console.error(err)
      }
    },
    landChoose(idx) {
      let cidx = this.landchecks.indexOf(idx)
      if (cidx === -1) {
        this.landchecks.push(idx)
      } else {
        this.landchecks.splice(cidx, 1)
      }
      console.debug('idx', idx, 'landchecks', this.landchecks)
    },
    async debugTest() {
      if (!this.provider) {
        await this.getNetworkAndChainId()
      }
      const blockNumber = await this.provider.getBlockNumber()
      console.log('last blockNumber', blockNumber)

      switch(this.testtype) {
      case 'code':
        const code = await this.provider.getCode(this.testinput)
        console.log(this.testinput, 'code', code)
        break
      case 'block':
        const block = await this.provider.getBlock(Number(this.testinput))
        console.log(this.testinput, 'block info', block)
        break
      case 'balances':
        const balances = await this.provider.getBalances(this.testinput || this.accounts[0])
        console.log(balances)
        break
      case 'resources':
        const resource = await this.provider.getResources(this.testinput || this.accounts[0])
        console.log(resource)
        break
      case 'transaction':
        const txn = await this.provider.getTransaction(this.testinput)
        console.log(this.testinput, 'transaction info', txn)
        break
      }
    },
  }
})