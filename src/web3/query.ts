import type { SuiClient } from '@mysten/sui/client';
import { fetchAllGroupIds, fetchGroupDetailsByIds, fetchAllDynamicObjectIds } from './utils'
import { PACKAGE_ID } from '../config/constants'

/**
 * Interface representing a frontend-friendly profile.
 */
interface Profile {
  objectId: string;
  userAddress: string;
  avatarUrl: string;
  bannerUrl: string;
  name: string;
  describeYourself: string;
  website: string;
  twitter: string;
  telegram: string;
  facebook: string;
}

interface DynamicField {
  objectId: string;
  fields: {
    id: { id: string };
    name: string;
    value: string;
  };
}

/**
 * Extracts the profile data from the raw JSON response and returns a complete FrontendProfile.
 *
 * If the profile's inner "fields" array is missing some fields, it will be filled in using default values.
 *
 * Expected order for the 8 fields:
 *   0 - AvatarUrl (required) - Default: "https://example.com/default-avatar.png"
 *   1 - BannerUrl (required) - Default: "https://example.com/default-banner.png"
 *   2 - Name (required)       - Default: "Default Name"
 *   3 - Describe Yourself     - Default: ""
 *   4 - Website               - Default: ""
 *   5 - Twitter               - Default: ""
 *   6 - Telegram              - Default: ""
 *   7 - Facebook              - Default: ""
 *
 * @param response - The raw JSON response object.
 * @returns A FrontendProfile with all fields filled.
 * @throws Error if the expected structure is not found.
 */
export async function getUserProfile(userAddress: string, suiClient: SuiClient): Promise<Profile> {
  const res = await suiClient.getOwnedObjects({
    owner: userAddress,
    options: {
      showContent: true,
      showType: true,
    },
    filter: {
      StructType: `${PACKAGE_ID}::profile::Profile`,
    },
  });
  if (!res || !res.data || !Array.isArray(res.data) || res.data.length === 0) {
    throw new Error("Invalid profile response data");
  }

  // Extract the first profile object from the data array.
  const profileData = res.data[0].data;
  if (!profileData) {
    throw new Error("Profile data not found in response");
  }

  // Destructure main properties
  const { objectId, version, digest, type, content } = profileData;
  if (!content || !content.fields) {
    throw new Error("Profile content or fields missing");
  }

  // The 'fields' container includes:
  // - "fields": the inner array of field values.
  // - "id": an object possibly containing an 'id' value.
  // - "user_address": the owner's blockchain address.
  const fieldsContainer = content.fields;

  // Get the raw fields array, if available.
  const rawFields: string[] = Array.isArray(fieldsContainer.fields) ? fieldsContainer.fields : [];

  // Map the complete fields array to friendly property names:
  const [avatarUrl, bannerUrl, name, describeYourself, website, twitter, telegram, facebook] = rawFields;
  
  // Return the frontend-friendly profile object.
  return {
    objectId,
    userAddress,
    avatarUrl,
    bannerUrl,
    name,
    describeYourself,
    website,
    twitter,
    telegram,
    facebook
  };
}


/**
 * High-level helper to fetch all group data owned by a specific user.
 * Internally combines the process of fetching group IDs and then retrieving their details.
 *
 * @param userAddress - The Sui address of the user whose group data should be fetched.
 * @param suiClient - An instance of the SuiClient used for querying both IDs and content.
 * @returns A promise that resolves to an array of detailed group objects, including `objectId` and `fields`.
 */
export async function getGroups(userAddress: string, suiClient: SuiClient) {
  const groupIds = await fetchAllGroupIds(userAddress, suiClient);
  const groupDetails = await fetchGroupDetailsByIds(groupIds, suiClient);
  return groupDetails
}


/**
 * Fetch detailed dynamic field objects by their objectIds, and extract their fields.
 *
 * @param objectIds - An array of object IDs to fetch.
 * @param suiClient - An instance of SuiClient to perform the query.
 * @returns A promise that resolves to an array of simplified dynamic field objects.
 */
export async function fetchFilesInGroup(
  groupId: string,
  suiClient: any
): Promise<DynamicField[]> {
  const fields = await fetchAllDynamicObjectIds(groupId, suiClient)
  const rawResults = await suiClient.multiGetObjects({
    ids: fields,
    options: { showContent: true },
  });

  return rawResults
    .map((obj): DynamicField | null => {
      const objectId = obj.data?.objectId;
      const fields = obj.data?.content?.fields;
      if (objectId && fields?.id && fields?.name && fields?.value !== undefined) {
        return { objectId, fields };
      }
      return null;
    })
    .filter(Boolean) as DynamicField[];
}

export async function getUserPass(groupId: string, userAddress: string, suiClient: SuiClient) {
  const res = await suiClient.getOwnedObjects({
    owner: userAddress,
    options: {
      showContent: true,
    },
    filter: {
      StructType: `${PACKAGE_ID}::group::Pass`,
    },
  });
  const clock = await suiClient.getObject({
    id: '0x6',
    options: { showContent: true },
  });
  const fields = (clock.data?.content as { fields: any })?.fields || {};
  const current_ms = fields.timestamp_ms;

  const valid_subscription = res.data
    .map((obj) => {
      const fields = (obj!.data!.content as { fields: any }).fields;
      const x = {
        id: fields?.id.id,
        group_id: fields?.group_id,
        policy: fields?.policy,
        ttl: fields?.ttl,
        created_at: parseInt(fields?.created_at),
      };
      return x;
    })
    .filter((item) => item.group_id === groupId)
    .find((item) => {
      return item.created_at + parseInt(item.ttl) > current_ms;
    });
  return valid_subscription
}

export async function getOwnerGroups(userAddress: string, suiClient: SuiClient) {
  const res = await suiClient.getOwnedObjects({
    owner: userAddress,
    options: {
      showContent: true,
    },
    filter: {
      StructType: `${PACKAGE_ID}::group::Cap`,
    },
  });

  // find the cap for the given service id
  const capIds = res.data
    .map((obj) => {
      const fields = (obj!.data!.content as { fields: any }).fields;
      return {
        id: fields?.id.id,
        group_id: fields?.group_id,
      };
    })
    // .filter((item) => item.group_id === id)
    // .map((item) => item.id) as string[];
  return capIds
}