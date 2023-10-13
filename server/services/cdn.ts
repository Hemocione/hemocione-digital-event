import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { callNodeListener, H3Event } from "h3";
const config = useRuntimeConfig();
const { bucket, basePath, baseUrl } = config.cdn;

const s3 = new S3Client();

const getUploader = (uploadedFiles: string[]) =>
  multer({
    storage: multerS3({
      s3,
      bucket,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: function (_req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (_req, file, cb) {
        const filePath = `${basePath}/${Date.now().toString()}-${file.originalname
          .toLocaleLowerCase()
          .replace(/\s+/g, "-")}`;
        uploadedFiles.push(`${baseUrl}/${filePath}`);
        cb(null, filePath);
      },
    }),
  });

export async function uploadImage(event: H3Event) {
  const uploadedFiles: string[] = [];
  const uploader = getUploader(uploadedFiles);
  await callNodeListener(
    // @ts-expect-error: Nuxt 3
    uploader.single("image"),
    event.node.req,
    event.node.res,
  );

  const fileUrl = uploadedFiles[0];
  return fileUrl;
}
