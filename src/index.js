import StarMaskOnboarding from '@starcoin/starmask-onboarding'
import { hexlify } from '@ethersproject/bytes'
import { providers, utils, bcs, version as starcoinVersion } from '@starcoin/starcoin'
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
    provider: null,
    w3Provider: null,
    ldtamount: 0,
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
      console.log('starcoin JS SDK version', starcoinVersion)
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

      if (window.starcoin && !this.w3Provider) {
        window.starcoin.on('accountsChanged', this.handleNewAccounts)
        window.starcoin.on('chainChanged', this.handleNewChain)
        window.starcoin.on('networkChanged', this.handleNewNetwork)

        this.w3Provider = new providers.Web3Provider(window.starcoin, 'any')
      }
      if (!this.provider) {
        await this.getNetworkAndChainId()
      }

      this.landInit()
    },
    onClickConnect() {
      window.starcoin.request({
        method: 'stc_requestAccounts',
      }).then(newAccounts=>{
        this.handleNewAccounts(newAccounts)
      }).catch(error=>{
        console.error(error)
      })
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
      console.debug('check land', idx)
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
      return bufferToHex(new TextEncoder().encode(str), '')
    },
    setLandInfo(functionId = '::land_set_message') {
      const args = []
      if ('::ldt_mint' === functionId) {
        args.push(Number(this.setinput) || 1000)
      } else if (this.landchecks.length !== 1) {
        alert('暂时仅支持修改单个土地信息')
        return
      } else {
        args.push(this.landchecks[0])
      }
      switch (functionId) {
      case '::ldt_mint':
      case '::land_trade':
        break
      case '::land_set_price':
      case '::land_set_message':
      case '::land_set_bkcolor':
        if (!this.setinput) {
          alert('请先输入要替换的信息')
          return
        }
        args.push('::land_set_price' === functionId ? Number(this.setinput) : this.setinput)
        break
      default:
        alert(functionId, 'not support yet')
        return
      }
      this.signContact(functionId, args)
    },
    signContact(functionId, args){
      functionId = this.contract_address + functionId
      console.debug('functionId', functionId, 'args', args)
      this.getPayloadHex(functionId, [], args).then(hex=>{
        console.debug('getPayloadHex', hex)
        this.sendTransaction(hex)
      }).catch(e=>{
        this.testresult = e.message || e
        console.error('send message fail', e)
      })
    },
    getPayloadHex(functionId, tyArgs = [], args = [], nodeUrl = this.nodeUrlMap[this.currentnode]) {
      if (!functionId) {
        this.testresult = 'functionId is expected'
        console.error('functionId is expected for payloadInHex')
        return Promise.reject(this.testresult)
      }
      return utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl).then(sf=>{
        console.debug('get scriptFunction', sf)
        const se = new bcs.BcsSerializer()
        sf.serialize(se)
        return hexlify(se.getBytes())
      })
    },
    sendTransaction(payloadInHex) {
      if (!payloadInHex) {
        this.testresult = 'payloadInHex is expected'
        console.error('payloadInHex is expected for payloadInHex')
        return
      }
      this.w3Provider.getSigner().sendUncheckedTransaction({
        data: payloadInHex
      }).then(res=>{
        console.log('send transaction result', res)
        this.testresult = res
        // this.landInit()
      }).catch(e=>{
        this.testresult = e.message || e
        console.error('send transaction fail', e)
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
        this.provider.getCode(this.testinput).then(res=>{
          this.testresult = res
          console.log(this.testinput, 'code', this.testresult)
        }).catch(e=>{
          this.testresult = e.message || e
        })
        break
      case 'block':
        this.provider.getBlock(Number(this.testinput)).then(res=>{
          this.testresult = res
          console.log(this.testinput, 'block info', this.testresult)
        }).catch(e=>{
          this.testresult = e.message || e
        })
        break
      case 'balances':
        this.provider.getBalances(this.testinput || this.accounts[0]).then(res=>{
          this.testresult = res
          console.log(this.testinput, 'balances info', this.testresult)
        }).catch(e=>{
          this.testresult = e.message || e
        })
        break
      case 'resources':
        this.provider.getResources(this.testinput || this.accounts[0]).then(res=>{
          this.testresult = res
          console.log(this.testinput, 'resources', this.testresult)
        }).catch(e=>{
          this.testresult = e.message || e
        })
        break
      case 'transaction':
        this.provider.getTransaction(this.testinput).then(res=>{
          this.testresult = res
          console.log(this.testinput, 'transaction', this.testresult)
        }).catch(e=>{
          this.testresult = e.message || e
        })
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
    testToString() {
      this.testresult = this.vecToString(this.drybody)
    },
    testToHex() {
      this.testresult = this.stringTohex(this.drybody)
    },
  }
})