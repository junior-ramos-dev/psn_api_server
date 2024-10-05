import axios, { AxiosResponse } from "axios";
import * as fs from "fs";
import sharp from "sharp";

/**
 * Download image binary data
 *
 * @param imageUrl
 * @returns
 */
export const downloadImgToBase64 = async (
  imageUrl: string
): Promise<string> => {
  let data: string = "";

  await axios
    .get(imageUrl, {
      responseType: "text",
      responseEncoding: "base64",
    })
    .then((res: AxiosResponse) => {
      console.log("[Success downloading image binary data]");

      data = res.data;
    })
    .catch((err) => {
      console.log("[Failure downloading image binary data]");
      console.log(err);
    });
  return data;
};

/**
 * Download image file to disk
 *
 * @param imageUrl
 * @param filePath
 * @param fileName
 */
export const dolwnloadImgToDisk = async (
  imageUrl: string,
  filePath: string,
  fileName: string
) => {
  await axios
    .get(imageUrl, {
      responseType: "text",
      responseEncoding: "base64",
    })
    .then((res) => {
      console.log(res);
      console.log("[Success downloading image file to disk]");
      try {
        const data = res.data;
        fs.writeFileSync(`${filePath}${fileName}`, JSON.stringify(data), {
          encoding: "base64",
        });
      } catch (err) {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log("Failure downloading image file to disk]");
      console.log(err);
    });
};

/**
 * Resize image base 64 to Webp base 64
 *
 * @param imageBase64
 * @param resizeWidth
 * @param resizeHeight
 * @returns
 */
export const resizeImgToWebpBase64 = async (
  imageBase64: string,
  resizeWidth: number,
  resizeHeight: number
) => {
  const imgBuffer = Buffer.from(imageBase64, "base64");

  const bufferImgWebp = await sharp(imgBuffer)
    .webp({ lossless: true })
    .resize({ width: resizeWidth, height: resizeHeight })
    .toBuffer()
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(`Error on compress: ${err}`);
    });

  if (bufferImgWebp) {
    return bufferImgWebp.toString("base64");
  }
};
