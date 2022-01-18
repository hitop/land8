module 0x125ffbe331db6fbf49ee0e62f22321a3::Land8 {
  use 0x1::Signer;
  use 0x1::Token;
  use 0x1::Account;
  use 0x1::Vector;

  const MY_ADDRESS: address = @0x125ffbe331db6fbf49ee0e62f22321a3;
  const LAND_AMOUNT: u8 = 8;

  // land trade token
  struct LDT has copy, drop, store {}

  struct Land has store {
    id: u8,
    owner: address,
    price: u128,
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

  public(script) fun land_list_init(account: signer) {
    // land8 create
    assert(Signer::address_of(&account) == MY_ADDRESS, 0);

    let lands = Vector::empty<Land>();
    let id: u8 = 0;
    while (id < LAND_AMOUNT) {
      Vector::push_back(&mut lands, land_new(id));
      id = id + 1;
    };

    move_to(&account, Land_Lists { lands });
  }

  public(script) fun ldt_init(account: signer) {
    Token::register_token<LDT>(&account, 3);
    Account::do_accept_token<LDT>(&account);
  }

  public(script) fun ldt_mint(account: signer, amount: u128) {
    let token = Token::mint<LDT>(&account, amount);
    Account::deposit_to_self<LDT>(&account, token)
  }

  public(script) fun land_set_price(account: signer, landid: u8, price: u128) {
    let land_list = borrow_global_mut<Land_Lists>(MY_ADDRESS);
    let land = Vector::borrow_mut(&mut land_list.lands, landid);
    assert(Signer::address_of(&account) == land.owner, 0);

    land.price = price;
  }

  public(script) fun land_set_bkcolor(account: signer, landid: u8, bkcolor: vector<u8>) {
    let land_list = borrow_global_mut<Land_Lists>(MY_ADDRESS);
    let land = Vector::borrow_mut(&mut land_list.lands, landid);
    assert(Signer::address_of(&account) == land.owner, 0);

    land.bkcolor = bkcolor;
  }

  public(script) fun land_set_message(account: signer, landid: u8, message: vector<u8>) {
    let land_list = borrow_global_mut<Land_Lists>(MY_ADDRESS);
    let land = Vector::borrow_mut(&mut land_list.lands, landid);
    assert(Signer::address_of(&account) == land.owner, 0);

    land.message = message;
  }

  public(script) fun land_trade(account: signer, landid: u64) acquires Land_Lists {
    let buyer: address = Signer::address_of(&account);
    let land_list = borrow_global_mut<Land_Lists>(MY_ADDRESS);
    let land  = Vector::borrow_mut(&mut land_list.lands, landid);

    let buyldt: Token::Token<LDT> = Account::withdraw<LDT>(&account, land.price);
    // buyer LDT to owner
    // owner to signer?
    // Account::deposit_to_self<LDT>(owner, buyldt);
    Account::deposit_to_self<LDT>(&account, buyldt);

    // land owner and price change
    land.owner = buyer;
    land.price = land.price * 2;
  }
}