module 0x125ffbe331db6fbf49ee0e62f22321a3::Land8 {
  use 0x1::Signer;
  use 0x1::Token;
  use 0x1::Account;

  const MY_ADDRESS: address = @0x125ffbe331db6fbf49ee0e62f22321a3;
  const LAND_AMOUNT: u8 = 8;

  // land trade token
  struct LDT copy, drop, store {}

  struct Land has store {
    id: u8,
    owner: address,
    price: u64,
    message: vector<u8>,
    bkcolor: vector<u8>,
  }

  fun land_new(id: u8): Land {
    Land {
      id, owner: MY_ADDRESS,
      price: 1000,
      message: b"It is a land.",
      bkcolor: b"#FFD688",
    }
  }

  struct Land_Lists has key, store {
    lands: vector<Land>,
  }

  public(script) fun land_list_init(account: &signer) {
    // land8 create
    assert!(Signer::address_of(account) == MY_ADDRESS, 0);

    let lands = Vector::empty<Land>();
    let id: u8 = 1;
    while (id <= LAND_AMOUNT) {
      Vector::push_back(&mut lands, land_new(id));
      id = id + 1;
    };

    move_to(account, Land_Lists { lands });
  }

  public(script) fun ldt_init(account: &signer) {
    Token::register_token<LDT>(account, 3);
    Account::do_accept_token<LDT>(account);
  }

  public(script) fun ldt_mint(account: &signer, amount: u128) {
    let token = Token::mint<LDT>(account, amount);
    Account::deposit_to_self<LDT>(account, token)
  }

  public(script) fun land_trade(account: &signer, landid: u8) {
    let buyer: address = Signer::address_of(account);
    let land_list = borrow_global_mut<Land_Lists>(MY_ADDRESS);
    let land  = Vector::borrow(&mut land_list.lands, landid);

    let Land { id: _, owner, price, message: _, bkcolor: _ } = land;
    let buyldt: Token<LDT> = Account::withdraw<LDT>(account, (price as u128));
    Account::deposit_to_self<LDT>(owner, buyldt);   // 转账
    land.owner: address = buyer;        // owner 转让/覆盖
    land.price: u64 = land.price * 2;   // 价格上涨（算法待优化
  }
}