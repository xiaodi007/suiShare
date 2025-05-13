import type { SuiClient } from '@mysten/sui/client';
import { PACKAGE_ID } from '../config/constants';

interface GroupFields {
    name: string;
    fee_pre_ms: string;
    fee_cut_off: string;
    open_time: string;
    close_time: string;
    owner: string;
    id: { id: string };
  }
  
interface GroupObject {
    objectId: string;
    fields: GroupFields;
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
 * Fetch all group object IDs (group_id) owned by a specific address.
 * It scans through all pages of the user's `group::Cap` objects and extracts their corresponding group IDs.
 *
 * @param owner - The Sui address that owns the group Cap objects.
 * @param client - An instance of the SuiClient used to query the chain.
 * @returns A promise that resolves to an array of group object IDs.
 */
 export async function fetchAllGroupIds(owner: string, client: SuiClient): Promise<string[]> {
    const groupIds: string[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;
    const MAX_RETRIES = 5;
    const SLEEP_MS = 100; // basic delay between paged requests to avoid overload
  
    // Utility: sleep function
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  
    // Fetch with retry and exponential backoff
    const safeGetOwnedObjects = async (cursor: string | null, attempt = 1): Promise<any> => {
      try {
        return await client.getOwnedObjects({
          owner,
          cursor,
          options: {
            showContent: true,
          },
          filter: {
            StructType: `${PACKAGE_ID}::group::Cap`,
          },
        });
      } catch (err) {
        if (attempt >= MAX_RETRIES) throw new Error(`Max retry attempts reached: ${err}`);
        const delay = Math.pow(2, attempt) * 100; // exponential backoff
        console.warn(`Fetch failed (attempt ${attempt}), retrying in ${delay}ms...`);
        await sleep(delay);
        return safeGetOwnedObjects(cursor, attempt + 1);
      }
    };
  
    while (hasNextPage) {
      const res = await safeGetOwnedObjects(cursor);
  
      // Extract group_id safely
      for (const item of res.data) {
        const groupId = item.data?.content?.fields?.group_id;
        if (groupId) {
          groupIds.push(groupId);
        }
      }
  
      cursor = res.nextCursor;
      hasNextPage = res.hasNextPage;
  
      // Throttle a bit between pages
      await sleep(SLEEP_MS);
    }
  
    return groupIds;
  }

/**
 * Fetch detailed on-chain data for each group ID.
 * It uses `multiGetObjects` to batch fetch all corresponding `group::Group` objects and extracts their fields.
 *
 * @param groupIds - An array of group object IDs to fetch.
 * @param client - An instance of the SuiClient used to query the chain.
 * @returns A promise that resolves to an array of objects containing `objectId` and associated `fields`.
 */
 export async function fetchGroupDetailsByIds(
    groupIds: string[],
    client: SuiClient
  ): Promise<GroupObject[]> {
    const results = await client.multiGetObjects({
      ids: groupIds,
      options: { showContent: true },
    });
  
    return results
      .map((obj: any): GroupObject | null => {
        const objectId = obj.data?.objectId;
        const fields = obj.data?.content?.fields as GroupFields | undefined;
        return objectId && fields ? { objectId, fields } : null;
      })
      .filter(Boolean) as GroupObject[];
  }


/**
 * Fetch all objectIds from a dynamic field query with pagination support.
 * This is useful for cases where dynamic fields are stored as child objects (e.g., dynamic table entries).
 *
 * @param parentId - The parent object ID that owns the dynamic fields.
 * @param suiClient - An instance of the SuiClient used to query the dynamic fields.
 * @returns A promise that resolves to an array of objectId strings.
 */
export async function fetchAllDynamicObjectIds(
    groupId: string,
    suiClient: SuiClient
  ): Promise<string[]> {
    const objectIds: string[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;
  
    while (hasNextPage) {
      const res = await suiClient.getDynamicFields({
        parentId: groupId,
        cursor,
      });
  
      for (const entry of res.data) {
        if (entry.objectId) {
          objectIds.push(entry.objectId);
        }
      }
  
      cursor = res.nextCursor;
      hasNextPage = res.hasNextPage;
    }
  
    return objectIds;
  }
  