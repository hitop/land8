### Acccount

account default 0x125ffbe331db6fbf49ee0e62f22321a3

dev get-coin -v 100000STC
account show 0x125ffbe331db6fbf49ee0e62f22321a3
account unlock
account transfer -s 0x125ffbe331db6fbf49ee0e62f22321a3 -r 0xF7eA75c717892E5dfce5844cE4271DD6 -v 10000000 -b

### docker

``` sh
docker run --name starcoin -d --network host -v ~/.starcoin/:/root/.starcoin/ starcoin/starcoin:latest /starcoin/starcoin -n main

docker run --rm -it -v  ~/.starcoin/:/root/.starcoin/ starcoin/starcoin:latest /starcoin/starcoin --connect /root/.starcoin/main/starcoin.ipc console

docker run --name starcoin --rm -it -v /elecv2p/efss/move/:/move/ starcoin/starcoin:latest /starcoin/starcoin -n dev console

docker exec -it starcoin /bin/bash

docker cp /elecv2p/efss/move/MyToken.move ac77de099f0a:/MyToken.move

docker cp ac77de099f0a:/root/.starcoin/cli/dev/tmp/73a06a9f4fd33d8ae47520e2e016730b/MyCounter.mv /elecv2p/efss/move/MyCounter2.mv
```

#### compile

dev compile examples/my_counter/module/MyCounter.move

dev compile /elecv2p/efss/move/MyCounter.move
dev compile /MyCounter.move

dev compile /move/Land8.move -o /move

### deploy

dev deploy C:\\kFile\\land8\\land8\\contract\\test\\Land8.mv -b

dev deploy /root/.starcoin/cli/dev/tmp/0f47c8b6f193969c262742ef676f66e4/MyCounter.mv -b

### execute

``` sh
account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::Coin::mint -b

account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::MyCounter::init_counter -b

state get resource 0x125ffbe331db6fbf49ee0e62f22321a3 0x125ffbe331db6fbf49ee0e62f22321a3::MyCounter::Counter

account execute-function --function 0x30695116eaee6e3b45a88ee2b099f75b::MyCounter::init_counter -b

account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::MyToken::mint --arg 123u128 -b
account transfer -s 0x125ffbe331db6fbf49ee0e62f22321a3 -r 0xF7eA75c717892E5dfce5844cE4271DD6 -v 10 -t 0x125ffbe331db6fbf49ee0e62f22321a3::Land8::LDT -b

account execute-function -s 0x3a8d6bea77f6b98dd32ec8e00114775b --function 0x125ffbe331db6fbf49ee0e62f22321a3::LdtToken::init -b
# "abort_code": 25858,
# "explain": {
#   "category_code": 2,
#   "category_name": "REQUIRES_ADDRESS",
#   "reason_code": 101,
#   "reason_name": "ETOKEN_REGISTER"
# }

account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::Land8::ldt_init -b
account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::Land8::land_list_init -b
account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::Land8::ldt_mint --arg 1200000u128 -b
account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::Land8::land_set_message --arg 1u64 x"68656c6c6f206c616e64e59295e59295" -b

state get resource 0x125ffbe331db6fbf49ee0e62f22321a3 0x125ffbe331db6fbf49ee0e62f22321a3::MyToken::MyToken

account execute-function -s 0x0da41daaa9dbd912647c765025a12e5a --function 0x8c4d3877592931cacbd87eeb65c9e4f8::MyCounter::init_counter -b
contract get resource 0x0da41daaa9dbd912647c765025a12e5a 0x8c4d3877592931cacbd87eeb65c9e4f8::MyCounter::Counter
account execute-function -s 0x0da41daaa9dbd912647c765025a12e5a --function 0x8c4d3877592931cacbd87eeb65c9e4f8::MyCounter::incr_counter -b
contract get resource 0x0da41daaa9dbd912647c765025a12e5a 0x8c4d3877592931cacbd87eeb65c9e4f8::MyCounter::Counter
```

#### JS-JDK

``` JS
fetch('http://localhost:9850', {
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "id":101, 
    "jsonrpc":"2.0", 
    "method":"contract.resolve_function", 
    "params":["0x1::TransferScripts::peer_to_peer_v2"]
  })
}).then(res=>res.text()).then(s=>console.log(s))

{
 "id":200, 
 "jsonrpc":"2.0", 
 "method":"contract.dry_run", 
 "params":[
    {
      "chain_id": 254,
      "gas_unit_price": 1,
      "sender": "0x125ffbe331db6fbf49ee0e62f22321a3",
      "sender_public_key": "0xc61eeb76eef6fa27b959dd924d3c0e093a88277bc9b1c5122c0bac49ec9c5adc",
      "max_gas_amount": 40000000,
      "script": {
        "code": "0x125ffbe331db6fbf49ee0e62f22321a3::MyToken::mint", 
        "args": ["10000000u128"]
      }
    }
  ]
}
```