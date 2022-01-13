module {{sender}}::Land8 {
	use 01::Signer;

	// land trade token
	struct LDT copy, drop, store {}

	struct Land has store {
		owner: address,
		
	}
}