// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

// Based on the subscription pattern.
// TODO: document and add tests

module suishare::group{
use sui::event;
use std::string::String;
use sui::{clock::Clock, coin::Coin, dynamic_field as df, sui::SUI};

const GROUP_TYPE_Free: u8 = 0;
const GROUP_TYPE_Paid: u8 = 1;
const GROUP_TYPE_Time_Capsule: u8 = 2;

const POLICY_Monthly: u8 = 0;
const POLICY_Quarterly: u8 = 1;
const POLICY_Annual: u8 = 2;
const POLICY_Lifetime: u8 = 3;
const POLICY_Free: u8 = 4;

const MS_Monthly: u64 = 2_592_000_000;
const MS_Quarterly: u64 =  7_776_000_000;
const MS_Annual: u64 = 31_536_000_000;
const MS_Lifetime: u64 = 9_007_199_254_740_991;
const MS_Free: u64 = 9_007_199_254_740_991;

const EInvalidCap: u64 = 0;
const EInvalidPolicy: u64 = 1;
const EInvalidFee: u64 = 2;
const ENoAccess: u64 = 3;
const EFeeRequired: u64 = 4;
const EFeeNotAllowed: u64 = 5;

const PUBLISHER_ADDRESS: address = @0x2e87abbe6039e344a4db763a753ade3a86f1a146619e5cc6c92b144a542683f0;

public struct Group has key, store {
    id: UID,
    name: String,
    group_type: u8,
    owner: address,
    fee_pre_month: u64,
    fee_cut_off: u64,
    open_time: u64,
    close_time: u64,
}

public struct Pass has key, store {
    id: UID,
    group_id: ID,
    policy: u8,
    ttl: u64,
    created_at: u64,
    
}

public struct Cap has key, store {
    id: UID,
    group_id: ID,
    owner: address,
}

/// Event for profile creation
public struct GroupCreatedEvent has copy, drop {
    name: String,
    group_type: u8,
    owner: address,
    fee_pre_month: u64,
    fee_cut_off: u64,
    open_time: u64,
    close_time: u64,
}

public struct GroupUpdateEvent has copy, drop {
    group_id: ID,
    name: String,
    group_type: u8,
    owner: address,
    fee_pre_month: u64,
    fee_cut_off: u64,
    open_time: u64,
    close_time: u64,
}

/// Event for profile creation
public struct PassCreatedEvent has copy, drop {
    group_id: ID,
    policy: u8,
    ttl: u64,
    fee: u64,
    created_at: u64,
    user: address,
}

public struct FileApproveEvent has copy, drop {
    group_id: ID,
    operator: address,
    blob_id: String,
}

//////////////////////////////////////////
/////// Simple a service

/// Create a service.
/// The associated key-ids are [pkg id]::[service id][nonce] for any nonce (thus
/// many key-ids can be created for the same service).
public fun create_group(name: String,
                        group_type: u8,
                        fee_pre_month: u64, 
                        fee_cut_off: u64,  
                        open_time: u64,  
                        close_time: u64,
                        fee: Coin<SUI>,
                        ctx: &mut TxContext): (Cap, Pass) {
    let owner = ctx.sender();

    if (group_type == GROUP_TYPE_Time_Capsule) {
        assert!(fee.value() == 1000000000, EInvalidFee);
        // 取出 fee 并转账

        transfer::public_transfer(fee, PUBLISHER_ADDRESS); // 或者指定的 address
    } else {
        assert!(fee.value() == 0, EInvalidFee);
        fee.destroy_zero()
    };

    let group = Group {
        id: object::new(ctx),
        name,
        group_type,
        owner,
        fee_pre_month,
        fee_cut_off,
        open_time,
        close_time,
    };
    event::emit(GroupCreatedEvent { 
        name,
        group_type,
        owner,
        fee_pre_month,
        fee_cut_off,
        open_time,
        close_time,
     });

     let pass = Pass {
        id: object::new(ctx),
        group_id: object::id(&group),
        policy: POLICY_Lifetime,
        ttl: MS_Lifetime,
        created_at: 0,
    };
    
    let cap = Cap {
        id: object::new(ctx),
        group_id: object::id(&group),
        owner,
    };
    transfer::share_object(group);
    (cap, pass)
}

public fun update_group(group: &mut Group, 
                        cap: &Cap, 
                        name: String,
                        group_type: u8,
                        fee_pre_month: u64, 
                        fee_cut_off: u64,  
                        open_time: u64,  
                        close_time: u64, 
                        ctx: &mut TxContext) {
        let owner = ctx.sender();
        assert!(cap.group_id == object::id(group), EInvalidCap);
        assert!(cap.owner == owner, ENoAccess);
        
        group.name = name;
        group.fee_pre_month = fee_pre_month;
        group.fee_cut_off = fee_cut_off;
        group.open_time = open_time;
        group.close_time = close_time;
        event::emit(GroupUpdateEvent { 
            group_id: cap.group_id,
            group_type,
            name,
            owner,
            fee_pre_month,
            fee_cut_off,
            open_time,
            close_time
         });
    }

public fun buy_pass(
    fee: Coin<SUI>,
    policy: u8,
    group: &Group,
    c: &Clock,
    ctx: &mut TxContext,
): Pass {
    // Check if the current timestamp is within the valid open and close times
    assert!(c.timestamp_ms() >= group.open_time && c.timestamp_ms() <= group.close_time, ENoAccess);

    // Handle the special case for GROUP_TYPE_Time_Capsule where no pass purchase is required
    if (group.group_type == GROUP_TYPE_Time_Capsule) {
        // Time capsule groups still issue a pass, but no fee is required.
        assert!(policy == POLICY_Lifetime, EInvalidPolicy); // Time capsule groups should only support POLICY_Lifetime

        // Create the pass with no fee (fee is 0) and a lifetime TTL
        let ttl = MS_Lifetime;
        let pass = Pass {
            id: object::new(ctx),
            group_id: object::id(group),
            policy: POLICY_Lifetime,
            ttl,
            created_at: c.timestamp_ms(),
        };

        // Emit the PassCreatedEvent
        event::emit(PassCreatedEvent {
            group_id: object::id(group),
            policy: POLICY_Lifetime,
            fee: 0, // No fee for time capsule
            ttl,
            created_at: c.timestamp_ms(),
            user: ctx.sender(),
        });
fee.destroy_zero();
        // Return the pass
        return pass
    };

    // Ensure that the group type is compatible with the policy for other types
    if (group.group_type == GROUP_TYPE_Free) {
        assert!(policy == POLICY_Free, EInvalidPolicy); // Only POLICY_Free is allowed for free groups
    } else if (group.group_type == GROUP_TYPE_Paid) {
        assert!(policy != POLICY_Free, EFeeRequired); // Paid groups must not have POLICY_Free
    };

    // Calculate expected fee and TTL based on the selected policy
    let expected_fee: u64;
    let ttl: u64;
    if (policy == POLICY_Monthly) {
        expected_fee = group.fee_pre_month * 1;
        ttl = MS_Monthly;
    } else if (policy == POLICY_Quarterly) {
        expected_fee = group.fee_pre_month * 3;
        ttl = MS_Quarterly;
    } else if (policy == POLICY_Annual) {
        expected_fee = group.fee_pre_month * 12;
        ttl = MS_Annual;
    } else if (policy == POLICY_Lifetime) {
        expected_fee = group.fee_cut_off;
        ttl = MS_Lifetime;
    } else if (policy == POLICY_Free) {
        expected_fee = 0;
        ttl = MS_Free;
    } else {
        abort EInvalidPolicy
    };

    // Ensure the fee matches the expected fee
    assert!(fee.value() == expected_fee, EInvalidFee);
    if (expected_fee > 0) {
        // Transfer the fee to the group owner
        transfer::public_transfer(fee, group.owner);
    } else {
        // Destroy the fee if it's free
        fee.destroy_zero();
    };

    // Emit the PassCreatedEvent
    event::emit(PassCreatedEvent {
        group_id: object::id(group),
        policy,
        fee: expected_fee,
        ttl,
        created_at: c.timestamp_ms(),
        user: ctx.sender(),
    });

    // Create the Pass object and return it
    Pass {
        id: object::new(ctx),
        group_id: object::id(group),
        policy,
        ttl,
        created_at: c.timestamp_ms(),
    }
}

//////////////////////////////////////////////////////////
/// Access control
/// key format: [pkg id]::[service id][random nonce]

/// All allowlisted addresses can access all IDs with the prefix of the allowlist
fun approve_internal(id: vector<u8>, pass: &Pass, group: &Group, blob_id: String, c: &Clock, ctx: &TxContext): bool {

    if (group.owner == ctx.sender()) {
        return true
    };

    if (object::id(group) != pass.group_id) {
        return false
    };
    if (c.timestamp_ms() < group.open_time || c.timestamp_ms() > group.close_time) {
        return false
    };
    if (c.timestamp_ms() > pass.created_at + pass.ttl) {
        return false
    };

    event::emit(FileApproveEvent {
    group_id: pass.group_id,
    operator: ctx.sender(),
    blob_id: blob_id,
    } );

    // Check if the id has the right prefix
    is_prefix(group.id.to_bytes(), id)
}

entry fun seal_approve(id: vector<u8>, pass: &Pass, group: &Group, blob_id: String, c: &Clock, ctx: &TxContext) {
    assert!(approve_internal(id, pass, group, blob_id, c, ctx), ENoAccess);
}

/// Encapsulate a blob into a Sui object and attach it to the Subscription
public fun publish(group: &mut Group, cap: &Cap, blob_id: String, file_info: String) {
    assert!(cap.group_id == object::id(group), EInvalidCap);
    df::add(&mut group.id, blob_id, file_info);
}


public fun delete_blob(group: &mut Group, cap: &Cap, blob_id: String, ctx: &mut TxContext) {
    assert!(cap.group_id == object::id(group), EInvalidCap);
    assert!(cap.owner == ctx.sender(), ENoAccess);
    let _: String = df::remove(&mut group.id, blob_id);
}

public fun is_prefix(prefix: vector<u8>, word: vector<u8>): bool {
    if (prefix.length() > word.length()) {
        return false
    };
    let mut i = 0;
    while (i < prefix.length()) {
        if (prefix[i] != word[i]) {
            return false
        };
        i = i + 1;
    };
    true
}
}