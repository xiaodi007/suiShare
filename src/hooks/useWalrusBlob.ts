import { useEffect, useState } from "react";

import { AGGREGATOR_URL } from '../config/constants';

export function useWalrusBlob(blobId: string) {
  const [blobUrl, setBlobUrl] = useState<string>("");

  useEffect(() => {
    let url: string;

    const fetchBlob = async () => {
      try {
        const res = await fetch(`${AGGREGATOR_URL}/v1/blobs/${blobId}`);
        const blob = await res.blob();
        url = URL.createObjectURL(blob);

        setBlobUrl(url);
      } catch (err) {
        console.error("Failed to fetch blob:", err);
      }
    };

    if (blobId) {
      fetchBlob();
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [blobId]);

  return { blobUrl };
}
