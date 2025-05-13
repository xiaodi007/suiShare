module suishare::profile {
    use sui::event;
    use std::string::{String};
    /// Profile struct 
    public struct Profile has key, store {
        id: UID,
        user_address: address,
        fields: vector<String>,
        
    }

    /// Event for profile creation
    public struct ProfileCreatedEvent has copy, drop {
        owner: address,
        fields: vector<String>,
    }

    /// Event for field updates
    public struct ProfileFieldUpdatedEvent has copy, drop {
        owner: address,
        fields: vector<String>,
    }

    /// Create a new profile
    public fun create_profile(fields: vector<String>,ctx: &mut TxContext): Profile {
        let profile = Profile {
            id: object::new(ctx),
            user_address: tx_context::sender(ctx),
            fields,
        };
        event::emit(ProfileCreatedEvent { owner: tx_context::sender(ctx), fields });
        profile
    }

    /// Add or update a profile field
    public fun update_field(profile: &mut Profile, fields: vector<String>, ctx: &mut TxContext) {
        assert!(tx_context::sender(ctx) == profile.user_address);
        profile.fields = fields;
        event::emit(ProfileFieldUpdatedEvent { owner: tx_context::sender(ctx), fields });
    }

#[test]
public fun test_remove_middle_last_element() {
    use std::string::utf8;

    let mut ctx = tx_context::dummy();
    
    let mut profile = create_profile(vector[utf8(b"test"), utf8(b"test")]  ,&mut ctx, );
    // transfer::transfer(profile, ctx.sender());
    assert!(vector::length(&profile.fields) == 2, 0);
    update_field(&mut profile, 
    vector[utf8(b"test1"), utf8(b"test1"), utf8(b"test1")],
    &mut ctx);
    assert!(vector::length(&profile.fields) == 3, 0);
    transfer::transfer(profile, ctx.sender());
}
}

