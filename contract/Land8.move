module {{sender}}::Land8 {
	use 0x1::Signer;
	use 0x1::Token;
	use 0x1::Account;

	// land trade token
	struct LDT copy, drop, store {}

	struct Land has store {
		owner: address,
		price: u64,
		message: vector<u8>,
		bkcolor: vector<u8>,
	}

	public(script) fun init(account: signer) {
		Token::register_token<LDT>(&account, 3);
		Account::do_accept_token<LDT>(&account);
	}

	public(script) fun mint(account: signer, amount: u128) {
		let token = Token::mint<MyToken>(&account, amount);
		Account::deposit_to_self<MyToken>(&account, token)
	}
}