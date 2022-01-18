## Land8

a little land trade Dapp game.

一个土地交易小游戏，starcoin 智能合约测试应用。

![](https://raw.githubusercontent.com/hitop/land8/main/webui.png)

## Development/安装

``` sh
# Install dependencies
# 安装依赖
yarn
# 启动测试
yarn start
```

- 检查 Starmask 插件是否安装
- 然后浏览器打开 http://localhost:9022

## Contract deployment/智能合约部署

智能合约文件: **contract/Land8.move**

上线部署参考: [Deploy move contract](https://developer.starcoin.org/en/tutorials/deploy_move_contract/).

After you get the address of the contract, you could execute it in this test-dapp.

部署完成后可获取到合约地址，然后在网页中进行测试。

### 测试

``` sh
account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::Land8::ldt_init -b
account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::Land8::land_list_init -b
account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::Land8::ldt_mint --arg 1200000u128 -b
account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::Land8::land_set_message --arg 1u64 x"68656c6c6f206c616e64e59295e59295" -b
```

### 参考

- https://github.com/starcoinorg/starmask-test-dapp
- https://github.com/WestXu/mylegacy