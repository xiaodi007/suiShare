import dayjs from "dayjs";

export function groupByAddress(input) {
  const result = input?.data?.reduce((acc, item) => {
    // Extract the type and address information
    const typeString = item?.data?.type;
    const addressMatch = typeString.match(/<([^>]+)>/);
    const address = addressMatch ? addressMatch[1] : null;
    const cleanedType = typeString.replace(/<[^>]+>/, "");

    if (!address) {
      return acc;
    }

    // Find or create the entry for this address
    let addressEntry = acc?.find((entry) => entry.address === address);
    if (!addressEntry) {
      addressEntry = { address, items: [] };
      acc.push(addressEntry);
    }

    // Add the item with the cleaned type to the corresponding address entry
    addressEntry.items.push({
      type: cleanedType,
      object: item.data,
    });

    return acc;
  }, []);

  return result;
}
export function filterGroupsByType(groupedData, typesToFilter) {
  return groupedData?.filter((group) =>
    group.items?.some((item) => item.type.includes(typesToFilter))
  );
}
export function findObjectByAddressAndType(
  groupedData,
  targetAddress,
  targetType
) {
  // 查找指定的 address 对象
  const addressGroup = groupedData.find(
    (group) => group.address === targetAddress
  );
  if (!addressGroup) {
    return null; // 如果找不到 address，则返回 null
  }
  console.log(addressGroup);
  // 在找到的 address 对象中查找指定的 type
  const matchedItem = addressGroup.items.find((item) =>
    item.type.includes(targetType)
  );
  if (!matchedItem) {
    return null; // 如果找不到匹配的 type，则返回 null
  }

  // 返回匹配的 object
  return matchedItem.object;
}

export function generateClaimSchedule(
  vestingAmount,
  startDate,
  cliffDate,
  finalDate,
  intervalDurationMs
) {
  const dataPoints = [];
  const totalDuration = finalDate - startDate;
  const totalIntervals = Math.ceil(totalDuration / intervalDurationMs);
  const amountPerInterval = vestingAmount / totalIntervals;

  let currentDate = new Date(startDate);

  while (currentDate <= finalDate) {
    let vestedAmount = 0;

    if (currentDate >= cliffDate) {
      const elapsedDuration = currentDate - startDate;
      const elapsedIntervals = Math.floor(elapsedDuration / intervalDurationMs);

      vestedAmount = amountPerInterval * elapsedIntervals;
      vestedAmount = Math.min(vestedAmount, vestingAmount);
    }

    dataPoints.push({
      date: currentDate.getTime(),
      amount: vestedAmount,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dataPoints;
}

export async function getTreasuryCapObjects(client, packageIds) {
  // 使用 Promise.all 并行获取所有对象数据
  const objects = await Promise.all(
      packageIds.map(packageId => client.getObject({
          id: packageId.reference.objectId,
          options: { showType: true }
      }))
  );

  // 筛选包含 "TreasuryCap" 的对象，并提取 objectId 和泛型 type 值
  return objects
      .filter(obj => obj.data.type.includes("TreasuryCap"))
      .map(obj => ({
          objectId: obj.data.objectId,
          type: obj.data.type.match(/TreasuryCap<([^>]+)>/)[1]
      }));
}


/**
 * Calculates the maximum supply based on the precision provided.
 * The precision must be a non-negative number.
 * Returns an object containing the calculated maximum supply as a number and a formatted string.
 * @param {number} precision - The precision used to calculate the maximum supply
 * @returns {object} - An object with the calculated maximum supply as a number and a formatted string
 */
export function getMaxSupply(precision) {
  // Validate the precision input
  if (precision === undefined || precision === null) {
    throw new Error("Precision must be provided");
  }
  if (typeof precision !== "number") {
    throw new Error("Precision must be a number");
  }
  if (precision < 0) {
    throw new Error("Precision cannot be negative");
  }

  // Calculate the maximum supply
  const maxSupply = Math.pow(10, 19 - precision);

  let supplyString = "";
  if (maxSupply >= 1e12) {
    // Greater than or equal to one trillion, use 'trillion' as the unit
    supplyString = (maxSupply / 1e12).toFixed(0) + " trillion";
  } else if (maxSupply >= 1e8) {
    // Greater than or equal to one billion, use 'billion' as the unit
    supplyString = (maxSupply / 1e8).toFixed(0) + " billion";
  } else if (maxSupply >= 1e6) {
    // Greater than or equal to one million, use 'million' as the unit
    supplyString = (maxSupply / 1e6).toFixed(0) + " million";
  } else if (maxSupply >= 1e3) {
    // Greater than or equal to one thousand, use 'thousand' as the unit
    supplyString = (maxSupply / 1e3).toFixed(0) + " thousand";
  } else {
    // Less than one thousand, output the number directly
    supplyString = maxSupply.toString();
  }

  return {
    number: maxSupply,
    string: supplyString,
  };
}

/**
 * This function calculates the status based on the provided data object.
 * @param {Object} data - The data object containing timestamps and balance information
 * @returns {string} - The status based on the current time and provided timestamps
 */
export const getStatus = (data) => {
  // Get the current time in milliseconds
  const currentTime = Date.now();

  // Parse the start, cliff, and final timestamps from the data object
  const startTimestamp = parseInt(data?.start_timestamp_ms, 10);
  const cliffTimestamp = parseInt(data?.cliff_timestamp_ms || data?.start_timestamp_ms, 10);
  const finalTimestamp = parseInt(data?.final_timestamp_ms, 10);

  // Check the current time against the timestamps to determine the status
  if (currentTime < startTimestamp) {
    return "locked"; // Current time is before the start timestamp
  } else if (currentTime >= startTimestamp && currentTime < cliffTimestamp) {
    return "cliffed"; // Current time is between the start and cliff timestamps
  } else if (currentTime >= cliffTimestamp && currentTime < finalTimestamp && data?.current_balance !== '0') {
    return "releasing"; // Current time is between the cliff and final timestamps with non-zero balance
  } else {
    return "finished"; // Current time is after the final timestamp
  }
};

/**
 * Calculates the lock duration based on the start and end timestamps.
 * @param {number} startTimestamp - The start timestamp in milliseconds
 * @param {number} endTimestamp - The end timestamp in milliseconds
 * @returns {string} - The lock duration in months, days, or hours
 */
export const calculateLockDuration = (startTimestamp, endTimestamp) => {
  // Convert timestamps to Day.js objects
  const start = dayjs(parseInt(startTimestamp, 10));
  const end = dayjs(parseInt(endTimestamp, 10));

  // Calculate the difference in months, days, and hours
  const months = end.diff(start, "month"); // Calculate months
  const days = end.diff(start, "day"); // Calculate days
  const hours = end.diff(start, "hour"); // Calculate hours

  // Return the appropriate result based on the conditions
  if (months > 0) {
    return `${months} months`;
  } else if (days > 0) {
    return `${days} days`;
  } else if (hours > 0) {
    return `${hours} hours`;
  } else {
    return "< hour"; // If the time difference is less than an hour
  }
};
