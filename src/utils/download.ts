
const AGGREGATOR_URL = "https://aggregator.walrus-testnet.walrus.space";

export const downloadFile = async () => {
    const blobId = "0xc30b31c37335827e2c2e5dde1788c636aa77dbee03f052f1aab1f78e55d1575b"
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const aggregatorUrl = `/${AGGREGATOR_URL}/v1/blobs/${blobId}`;
        const response = await fetch(aggregatorUrl, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) {
            return null;
        }
        return await response.arrayBuffer();
    } catch (err) {
        console.error(`Blob ${blobId} cannot be retrieved from Walrus`, err);
        return null;
    }
}