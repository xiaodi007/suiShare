import { message } from "antd";
import { UploadChangeParam } from "antd/es/upload";

/**
 * Function to normalize file input.
 * 
 * @param e The event or file input.
 * @returns The normalized file list.
 */
export const normFile = (e: FileList | DragEvent | UploadChangeParam): any => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

/**
 * Function to handle file upload.
 * 
 * @param file The file to upload.
 * @returns The blobId of the uploaded file.
 */
export const handleUpload = async (file: File): Promise<string | undefined> => {
  try {
    const response = await fetch(
      `https://publisher.walrus-testnet.walrus.space/v1/store?epochs=100`,
      {
        method: "PUT",
        body: file,
      }
    );

    if (response?.status === 200) {
      const info = await response?.json();
      // console.log("Upload successful:", info);
      const blobId =
        info.newlyCreated?.blobObject?.blobId || info?.alreadyCertified?.blobId;
      message.success("Upload successful!");
      return blobId;
    } else {
      throw new Error("Something went wrong when storing the blob!");
    }
  } catch (error) {
    console.error("Error uploading the file:", error);
    message.error("Failed to upload the file.");
    return undefined;
  }
};
