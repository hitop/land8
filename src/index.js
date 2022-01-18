import StarMaskOnboarding from '@starcoin/starmask-onboarding'
import { providers, utils, bcs, encoding, version as starcoinVersion } from '@starcoin/starcoin'
import Vue from './vue.min.js'

import { sJson, sString, hexToBuffer, bufferToHex } from './string'

new Vue({
  el: ".land8",
  data: {
    contract_address: '0x125ffbe331db6fbf49ee0e62f22321a3::Land8',
    land8: [
      {
        owner: '0xf7ea75c717892e5dfce5844ce4271dd6',
        price: 0,
        message: 'It is a land.',
        bkcolor: '#223567'
      }, { owner: '0x125ffbe331db6fbf49ee0e62f22321a3' }, {}, {}, {}, {}, {}, {}
    ],
    setinput: '',
    accounts: [],
    nodeUrlMap: {
      '1': 'https://main-seed.starcoin.org',
      '2': 'https://proxima-seed.starcoin.org',
      '251': 'https://barnard-seed.starcoin.org',
      '253': 'https://halley-seed.starcoin.org',
      '254': 'http://localhost:9850',
    },
    landchecks: [],
    testtype: 'block',
    testinput: 0,
    testresult: '',
    currentnode: '254',
    drybody: `{
  "id":101, 
  "jsonrpc":"2.0", 
  "method":"contract.resolve_function", 
  "params":["0x1::TransferScripts::peer_to_peer_v2"]
}`,
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
    },
    testresultshow(){
      if (typeof this.testresult === 'object') {
        return JSON.stringify(this.testresult, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        2)
      }
      return sString(this.testresult)
    },
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
      if (!this.provider) {
        await this.getNetworkAndChainId()
      }

      this.landInit()
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
      console.debug('check land', idx + 1)
    },
    landInit(){
      if (!this.contract_address) {
        this.testresult = 'set contract address first'
        return
      }
      this.testresult = 'start to get land init infomation'
      this.provider.getResources(this.contract_address.split('::')[0]).catch(e=>{
        this.testresult = e.message || e
      }).then(res=>{
        this.testresult = res
        if (res && res[this.contract_address + '::Land_Lists']) {
          this.land8 = res[this.contract_address + '::Land_Lists'].lands.map(land=>{
            return {
              ...land,
              message: this.vecToString(land.message),
              bkcolor: this.vecToString(land.bkcolor),
            }
          })
          console.log('Land init info', this.testresult[this.contract_address + '::Land_Lists'].lands)
        }
      })
    },
    vecToString(vec){
      return new TextDecoder().decode(hexToBuffer(vec, null))
    },
    stringTohex(str){
      return 'x' + bufferToHex(new TextEncoder().encode(str), '')
    },
    setMessage() {
      if (this.landchecks.length !== 1) {
        alert('暂时仅支持修改单个土地信息')
        return
      }
      if (!this.setinput) {
        alert('请先输入要替换的信息')
        return
      }
      let message = this.stringTohex(this.setinput)
      const functionId = this.contract_address + '::land_set_message'
      // const tyArgs = [this.contract_address + '::LDT']
      const tyArgs = ['0x00000000000000000000000000000001::STC::STC']
      const args = [
        this.accounts[0], // "type_tag": "Address",
        `${ this.landchecks[0] + 1 }u64`, // "type_tag": "U64",
        `x\"${ message }\"`, //"type_tag": { "Vector": "U8" }
      ]

      const starcoinProvider = new providers.Web3Provider(window.starcoin, 'any')
      starcoinProvider.send('contract.call_v2', [{
        function_id: functionId,
        type_args: tyArgs,
        args,
      }]).then((result) => {
        if (result) {
          this.testresult = result
        } else {
          this.testresult = 'fetch failed'
        }
      })
    },
    async debugTest() {
      if (!this.provider) {
        await this.getNetworkAndChainId()
      }
      const blockNumber = await this.provider.getBlockNumber()
      console.log('last blockNumber', blockNumber)

      switch(this.testtype) {
      case 'code':
        this.provider.getCode(this.testinput).catch(e=>{
          this.testresult = e.message || e
        }).then(res=>{
          this.testresult = res
          console.log(this.testinput, 'code', this.testresult)
        })
        break
      case 'block':
        this.provider.getBlock(Number(this.testinput)).catch(e=>{
          this.testresult = e.message || e
        }).then(res=>{
          this.testresult = res
          console.log(this.testinput, 'block info', this.testresult)
        })
        break
      case 'balances':
        this.provider.getBalances(this.testinput || this.accounts[0]).catch(e=>{
          this.testresult = e.message || e
        }).then(res=>{
          this.testresult = res
          console.log(this.testresult)
        })
        break
      case 'resources':
        this.provider.getResources(this.testinput || this.accounts[0]).catch(e=>{
          this.testresult = e.message || e
        }).then(res=>{
          this.testresult = res
          console.log(this.testresult)
        })
        break
      case 'transaction':
        this.provider.getTransaction(this.testinput).catch(e=>{
          this.testresult = e.message || e
        }).then(res=>{
          this.testresult = res
          console.log(this.testresult)
        })
        console.log(this.testinput, 'transaction info', this.testresult)
        break
      }
    },
    dryRun() {
      fetch(this.nodeUrlMap[this.currentnode] || 'http://localhost:9850', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sJson(this.drybody)),
      }).then(res=>res.json()).catch(e=>{
        console.error(e)
        return { error: e.message }
      }).then(res=>{
        console.log(res)
        this.testresult = res
      })
    },
  }
})