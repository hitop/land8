### land8 智能合约设计/说明

struct Land {
	id: '土地序列号'
	owner: '当前土地拥有者',
	price: '当前转让价格',
	message: '前台显示信息',
	bkcolor: '土地背景颜色',
}

struct Land_Lists { lands: vector<Land> }

struct LDT {}

fun land_list_init();  // 生成 8 块土地
fun mint();       // 获取 Token
fun land_trade(account: &signer, landid: u8);      // 购买土地

fun land_set_price(account: &signer, landid: u8, price: u4);  // 设置土地价格
fun land_set_message(account: &signer, landid: u8, message: &str);  // 土地显示信息
fun land_set_bkcolor(account: &signer, landid: u8, bkcolor: &str);  // 设置背景颜色

### 说明

- 8 块土地的信息只存在于合约账号中
- LDT Token 属于每个账户

### 待添加/完成功能

- 显示信息消耗 token
- 土地扩充/种植/收获 token