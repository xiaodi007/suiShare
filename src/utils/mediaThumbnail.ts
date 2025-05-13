/**
 * 统一生成图片或视频缩略图，固定大小 120x100，返回 base64
 * 图片 => 缩放后绘制到 canvas
 * 视频 => 取首帧绘制到 canvas
 */
export async function generateMediaThumbnail(file: File, width = 20, height = 20): Promise<string> {
    if (!file || !file.type) throw new Error("Invalid file");

    if (file.type.startsWith("image/")) {
        return generateImageThumbnail(file, width, height);
    }

    if (file.type.startsWith("video/")) {
        return generateVideoThumbnail(file, width, height);
    }

    throw new Error("Unsupported media type for thumbnail");
}

function generateImageThumbnail(file: File, width: number, height: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) return reject("Canvas not supported");

                // 居中缩放
                const scale = Math.min(width / img.width, height / img.height);
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
                const dx = (width - scaledWidth) / 2;
                const dy = (height - scaledHeight) / 2;

                ctx.drawImage(img, dx, dy, scaledWidth, scaledHeight);
                const base64 = canvas.toDataURL("image/webp", 0.1);
                resolve(base64);
            };
            img.onerror = reject;
            img.src = reader.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function generateVideoThumbnail(file: File, width: number = 100, height: number = 60): Promise<File> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.src = url;
        video.crossOrigin = "anonymous";
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;

        video.onloadeddata = () => {
            video.currentTime = 0.1;
        };

        video.onseeked = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                URL.revokeObjectURL(url);
                return reject("Canvas not supported");
            }

            ctx.drawImage(video, 0, 0, width, height);
            canvas.toBlob(
                (blob) => {
                    URL.revokeObjectURL(url);
                    if (!blob) return reject("Thumbnail blob generation failed");

                    const thumbnailFile = new File(
                        [blob],
                        `${file.name.split(".")[0]}_thumbnail.jpg`,
                        { type: "image/jpeg" }
                    );
                    resolve(thumbnailFile);
                },
                'image/jpeg',
                0.5
            );
        };

        video.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };
    });
}
