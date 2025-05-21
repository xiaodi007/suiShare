export const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const getMediaType = (ext) => {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'];
  const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv'];
  const markdownExts = ['md'];

  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (markdownExts.includes(ext)) return 'md';

  return 'unknown';
}


// ✅ 2. 给定 feePerMs + 月份类型，计算发放币数
export function getTotalCoinsByType(typeIndex, feePerMsStr) {
  const monthsMap = [1, 3, 12];
    const months = monthsMap[typeIndex] ?? 1;
  
    const feePerMs = Number(feePerMsStr);
    const totalUnits = feePerMs * months;

    return {
        fee: totalUnits / 10 ** 9,
        actualCoins: totalUnits
    }
}