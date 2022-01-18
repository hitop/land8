### land8 智能合约设计/说明

struct Land {
	id: '土地序列号0-7'
	owner: '当前土地拥有者',
	price: '当前转让价格',
	message: '前台显示信息',
	bkcolor: '土地背景颜色',
}

struct Land_Lists { lands: vector<Land> }

struct LDT {}

fun land_list_init();  // 生成 8 块土地
fun ldt_mint();        // 获取 Token
fun land_trade(account: signer, landid: u64);      // 购买土地
fun land_set_price(account: signer, landid: u64, price: u128);  // 设置土地价格
fun land_set_message(account: signer, landid: u64, message: vector<u8>);  // 土地显示信息
fun land_set_bkcolor(account: signer, landid: u64, bkcolor: vector<u8>);  // 设置背景颜色

// public signer
// inner &signer

### 说明

- 8 块土地的信息只存在于合约账号中
- LDT Token 属于每个账户

### 一些操作

``` sh
account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::Land8::ldt_init -b
account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::Land8::land_list_init -b
account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::Land8::ldt_mint --arg 1200000u128 -b
account execute-function --function 0x125ffbe331db6fbf49ee0e62f22321a3::Land8::land_set_message --arg 1u64 x"68656c6c6f206c616e64e59295e59295" -b

account transfer -s 0x125ffbe331db6fbf49ee0e62f22321a3 -r 0xF7eA75c717892E5dfce5844cE4271DD6 -v 1000000 -t 0x125ffbe331db6fbf49ee0e62f22321a3::Land8::LDT -b
```

### 待添加/完成功能

- 显示信息消耗 token
- 修改信息消耗 token
- 土地扩充/种植/收获 token