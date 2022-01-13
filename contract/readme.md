### land8 智能合约设计/说明

struct Land {
	owner: '当前土地拥有者',
	price: '当前转让价格',
	message: '前台显示信息',
	bkcolor: '土地背景颜色',
}

struct LDT {}

fun mint();       // 获取 Token
fun lands_get();  // 获取所有土地信息
fun land_set_price(account: signer, landidx: u8, price: u4);  // 设置土地价格
fun land_set_message(account: signer, landidx: u8, message: &str);  // 土地显示信息
fun land_set_bkcolor(account: signer, landidx: u8, bkcolor: &str);  // 设置背景颜色

### 待添加/完成功能

- 显示信息消耗 token