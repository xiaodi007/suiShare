/*
#[test_only]
module suishare::suishare_tests;
// uncomment this line to import the module
// use suishare::suishare;

const ENotImplemented: u64 = 0;

#[test]
fun test_suishare() {
    // pass
}

#[test, expected_failure(abort_code = ::suishare::suishare_tests::ENotImplemented)]
fun test_suishare_fail() {
    abort ENotImplemented
}
*/

// module suishare::profile_tests {
//     use suishare::profile;
//     use sui::tx_context::TxContext;
//     use sui::object::UID;
//     use table::Table;

//     /// Test profile creation
//     public fun test_create_profile() {
//         let ctx = TxContext::new();
//         let profile = profile::create_profile(&mut ctx);
//         // Assert profile is created and event is emitted
//     }

//     /// Test adding and updating fields
//     public fun test_update_field() {
//         let ctx = TxContext::new();
//         let mut profile = profile_module::create_profile(&mut ctx);
//         profile::update_field(&mut profile, 'email', 'user@example.com', &ctx);
//         // Assert field is added and event is emitted
//     }

//     /// Test removing fields
//     public fun test_remove_field() {
//         let ctx = TxContext::new();
//         let mut profile = profile::create_profile(&mut ctx);
//         profile::update_field(&mut profile, "email", "user@example.com", &ctx);
//         profile::remove_field(&mut profile, "email", &ctx);
//         // Assert field is removed and event is emitted
//     }

//     /// Test access control
//     public fun test_access_control() {
//         let ctx = TxContext::new();
//         let mut profile = profile::create_profile(&mut ctx);
//         // Attempt to update from a different context and expect failure
//     }
// }

