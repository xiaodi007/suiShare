import { Transaction, coinWithBalance } from '@mysten/sui/transactions';
import { fromHex, SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';
import type { SuiClient } from '@mysten/sui/client';
import { PACKAGE_ID } from '../config/constants';
// create profile
/**
 * Create Profile PTB
 *
 * The profileArr array must be constructed with the following order (total 8 elements):
 * 0 - AvatarUrl (required, supported formats: JPEG, PNG, WEBP; file size < 10MB). Default: "https://example.com/default-avatar.png"
 * 1 - BannerUrl (required, supported formats: JPEG, PNG, WEBP; file size < 10MB). Default: "https://example.com/default-banner.png"
 * 2 - Name (required). Default: "Default Name"
 * 3 - Describe Yourself (optional). Default: "" (empty string)
 * 4 - Website (optional). Default: "" (empty string)
 * 5 - Twitter (optional). Default: "" (empty string)
 * 6 - Telegram (optional). Default: "" (empty string)
 * 7 - Facebook (optional). Default: "" (empty string)
 *
 * If any value is missing or empty in the provided profileArr, the default value will be used.
 */
export function createProfilePtb(profileArr: string[], userAddress: string) {
  // Create and configure the transaction
  const tx = new Transaction();
  tx.setGasBudget(10000000);

  const profileObj = tx.moveCall({
    arguments: [tx.pure.vector('string', profileArr)],
    target: `${PACKAGE_ID}::profile::create_profile`,
  });

  tx.transferObjects([profileObj], userAddress);
  return tx
}


/**
 * Update Profile PTB
 *
 * The profileArr array must be constructed with the following order (total 8 elements):
 * 0 - AvatarUrl (required, supported formats: JPEG, PNG, WEBP; file size < 10MB). Default: "https://example.com/default-avatar.png"
 * 1 - BannerUrl (required, supported formats: JPEG, PNG, WEBP; file size < 10MB). Default: "https://example.com/default-banner.png"
 * 2 - Name (required). Default: "Default Name"
 * 3 - Describe Yourself (optional). Default: "" (empty string)
 * 4 - Website (optional). Default: "" (empty string)
 * 5 - Twitter (optional). Default: "" (empty string)
 * 6 - Telegram (optional). Default: "" (empty string)
 * 7 - Facebook (optional). Default: "" (empty string)
 */
export function updateProfilePtb(profileArr: string[], profileId: string) {

  // Create and configure the transaction
  const tx = new Transaction();
  tx.setGasBudget(10000000);

  tx.moveCall({
    arguments: [tx.object(profileId), tx.pure.vector('string', profileArr)],
    target: `${PACKAGE_ID}::profile::update_field`,
  });

  return tx
}


/**
 * This function allows the creation of a group on the blockchain using a Move function (`create_group`).
 * Depending on the `groupType`, it will set specific parameters, including a potential fee for a time capsule group. 
 * The transaction created by this function is designed to create a new group and associated pass, which will be transferred to the given user address.

 * @param name - The name of the group to be created.
 * @param groupType - The type of the group (0: Free, 1: Paid, 2: Time Capsule).
 * @param feePreMouth - The fee per millisecond for the group. This applies to paid and free groups.
 * @param feeCutOff - The maximum fee limit (cut-off) for the group (used for calculating total fee).
 * @param openTime - The Unix timestamp (in seconds) for when the group subscription opens.
 * @param closeTime - The Unix timestamp (in seconds) for when the group subscription closes.
 * @param userAddress - The address of the group owner or recipient (who will receive the group and pass).
 * 
 * @returns {Transaction} - The constructed transaction that can be signed and sent to the blockchain.
 */
export function createGroupPtb(
  name: string,             // Name of the group (Free, Paid, or Time Capsule group)
  groupType: number,        // Type of the group (0: Free, 1: Paid, 2: Time Capsule)
  feePreMouth: number,      // Fee per millisecond (charged on a periodic basis, e.g., monthly)
  feeCutOff: number,        // Maximum fee limit for the group (e.g., one-time fee for lifetime)
  openTime: number,         // The timestamp (in seconds) when the group subscription opens
  closeTime: number,        // The timestamp (in seconds) when the group subscription closes
  userAddress: string,      // The address of the user (group owner or recipient) receiving the group and pass
) {
  // Initialize fee to 0 by default
  let fee = 0;

  // If the group type is Time Capsule (groupType === 2), set a fixed fee of 1,000,000,000 units
  const tx = new Transaction();

  // Set a fixed gas budget for the transaction (a fixed amount of gas required to process the transaction)
  tx.setGasBudget(10_000_000);
if (groupType === 2) {
  const [toDeposit] = tx.splitCoins(tx.gas, [1e9]);
  // Call the Move function `create_group` from the group package to create a new group and pass
  const [capObj, passObj] = tx.moveCall({
    target: `${PACKAGE_ID}::group::create_group`, // The Move function target (where the `create_group` function is defined)
    arguments: [
      tx.pure.string(name),         // Group name passed as a string (e.g., "MyGroup")
      tx.pure.u8(groupType),        // Group type passed as a u8 (0 for Free, 1 for Paid, 2 for Time Capsule)
      tx.pure.u64(feePreMouth),     // Fee per millisecond (u64, for calculating ongoing charges)
      tx.pure.u64(feeCutOff),       // Maximum fee limit (u64, the upper limit of fees that can be charged)
      tx.pure.u64(openTime),        // Open time as a Unix timestamp (u64)
      tx.pure.u64(closeTime),       // Close time as a Unix timestamp (u64)
      toDeposit,
    ],
  });

  // After creating the group and pass, transfer the group and pass objects to the specified user address
  tx.transferObjects([capObj, passObj], userAddress);
} else {
  const [toDeposit] = tx.splitCoins(tx.gas, [0]);
  const [capObj, passObj] = tx.moveCall({
    target: `${PACKAGE_ID}::group::create_group`, // The Move function target (where the `create_group` function is defined)
    arguments: [
      tx.pure.string(name),         // Group name passed as a string (e.g., "MyGroup")
      tx.pure.u8(groupType),        // Group type passed as a u8 (0 for Free, 1 for Paid, 2 for Time Capsule)
      tx.pure.u64(feePreMouth),     // Fee per millisecond (u64, for calculating ongoing charges)
      tx.pure.u64(feeCutOff),       // Maximum fee limit (u64, the upper limit of fees that can be charged)
      tx.pure.u64(openTime),        // Open time as a Unix timestamp (u64)
      tx.pure.u64(closeTime),       // Close time as a Unix timestamp (u64)
      toDeposit,
    ],
  });

  // After creating the group and pass, transfer the group and pass objects to the specified user address
  tx.transferObjects([capObj, passObj], userAddress);
}
  // Return the constructed transaction which can be signed and sent to the blockchain
  return tx;
}

export function updateGroupPtb(
  groupId: string,
  capId: string,
  name: string,
  groupType: number,           // Name of the group
  feePreMouth: number,       // Fee per millisecond
  feeCutOff: number,      // Maximum fee limit (cut-off)
  openTime: number,       // Group subscription open time (Unix timestamp in seconds)
  closeTime: number,      // Group subscription close time (Unix timestamp in seconds)
) {
  // Initialize a new transaction
  const tx = new Transaction();

  // Set a fixed gas budget for the transaction
  tx.setGasBudget(10_000_000);

  // Call the Move function `create_group` with the provided parameters
  tx.moveCall({
    target: `${PACKAGE_ID}::group::update_group`,
    arguments: [
      tx.object(groupId),
      tx.object(capId),
      tx.pure.string(name),       // Group name as a string
      tx.pure.u8(groupType),
      tx.pure.u64(feePreMouth),      // Fee per millisecond (u64)
      tx.pure.u64(feeCutOff),     // Cut-off fee limit (u64)
      tx.pure.u64(openTime),      // Open time (u64)
      tx.pure.u64(closeTime),     // Close time (u64)
    ],
  });

  return tx;
}


export interface PublishParams {
  groupObjectId: string;
  capId: string;
  moduleName: string;
  uploadBlobId: string;
  fileInfo: string;
  signAndExecute: (params: { transaction: Transaction }, options?: any) => Promise<any>;
}

/**
 * publishFile 负责构建交易并调用签名及执行函数
 */
export async function publishFile({
  groupObjectId,
  capId,
  uploadBlobId,
  fileInfo,
}: PublishParams) {
  const tx = new Transaction();
  tx.setGasBudget(10000000);
  tx.moveCall({
    target: `${PACKAGE_ID}::group::publish`,
    arguments: [tx.object(groupObjectId), tx.object(capId), tx.pure.string(uploadBlobId), tx.pure.string(fileInfo)],
  });

  return tx;
}

export async function deleteFile({
  groupObjectId,
  capId,
  blobId,
}) {
  const tx = new Transaction();
  tx.setGasBudget(10000000);
  tx.moveCall({
    target: `${PACKAGE_ID}::group::delete_blob`,
    arguments: [tx.object(groupObjectId), tx.object(capId), tx.pure.string(blobId)],
  });

  return tx;
}

/**
 * This function allows a user to purchase a pass for a specific group by calling the Move function `buy_pass`.
 * The function constructs a transaction that buys the pass for the group based on the provided parameters.
 * It sets a fixed gas budget for the transaction and transfers the created pass object to the specified user address.
 * The fee is adjusted based on the group type:
 * - If the group is free (groupType = 0) or a time capsule (groupType = 2), the fee is set to 0, as no payment is required.
 * 
 * @param fee - The fee that the user will pay for the pass (in SUI). 
 *             Note that for group types 0 (Free) and 2 (Time Capsule), the fee will be set to 0.
 * @param policy - The policy selected for the pass (e.g., monthly, yearly, lifetime). It defines the duration of the pass.
 * @param groupId - The unique identifier of the group for which the pass is being purchased.
 * @param userAddress - The address of the user who is purchasing the pass. This will be the recipient of the created pass.
 * 
 * @returns {Transaction} - The constructed transaction which can be signed and sent to the blockchain.
 */
export async function createPassPtb(
  fee: number,              // The fee for purchasing the pass (in SUI)
  policy: number,           // The policy selected for the pass (e.g., monthly, lifetime)
  groupId: string,          // The ID of the group for which the pass is being purchased
  userAddress: string       // The address of the user who will receive the pass
) {

  const tx = new Transaction();

  // Step 3: Set a fixed gas budget for the transaction
  // The gas budget is set to ensure that the transaction has enough resources to be processed by the blockchain
  tx.setGasBudget(10_000_000);

  // Step 4: Set the sender of the transaction
  // Set the sender of the transaction as the userAddress provided, since they are purchasing the pass
  tx.setSender(userAddress);

  // Step 5: Call the Move function `buy_pass`
  // Call the Move function `buy_pass` to create a pass for the user for the specified group. The parameters include:
  // - The fee paid for the pass (in SUI)
  // - The policy selected for the pass (e.g., monthly, lifetime)
  // - The ID of the group the pass is for
  // - The clock object ID (used for time-based checks)
  const passObj = tx.moveCall({
    target: `${PACKAGE_ID}::group::buy_pass`,       // The Move function to invoke
    arguments: [
      coinWithBalance({
        balance: BigInt(fee),                       // The fee amount passed as a BigInt for proper handling
      }),
      tx.pure.u8(policy),                            // The policy selected (e.g., 0 for monthly, 1 for lifetime)
      tx.object(groupId),                            // The unique ID of the group for which the pass is being bought
      tx.object(SUI_CLOCK_OBJECT_ID),                // The clock object ID to ensure the transaction follows time constraints
    ],
  });

  // Step 6: Transfer the created pass object to the specified user address
  // After the pass is created, the pass object is transferred to the provided user address
  tx.transferObjects([passObj], userAddress);

  // Step 7: Return the constructed transaction
  // Finally, return the transaction that has been built so it can be signed and sent to the blockchain
  return tx;
}


export async function approvePtb(
  fileIds: string,
  groupId: string,
  passId: string,
  suiClient: SuiClient
) {
  // Initialize a new transaction
  const tx = new Transaction();

  // Set a fixed gas budget for the transaction
  tx.setGasBudget(10_000_000);
  for (let index = 0; index < fileIds.length; index++) {
    const fileId = fileIds[index];
    tx.moveCall({
      target: `${PACKAGE_ID}::group::seal_approve`,
      arguments: [
        tx.pure.vector('u8', fromHex(fileId)),
        tx.object(passId),
        tx.object(groupId),
        tx.pure.string(fileId),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    });
  }
  const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });

  // Return the constructed transaction
  return txBytes;
}