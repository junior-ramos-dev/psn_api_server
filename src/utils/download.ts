import axios, { AxiosResponse } from "axios";
import * as fs from "fs";

// Download image binary data
export const dolwnloadFileToBase64 = async (
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

// Download image file to disk
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

  // fetch(imgUrl, {
  //   headers: {
  //     "Content-Type": "image/png",
  //     // "Accept-Encoding": "base64",
  //   },
  // })
  //   .then((res) => {
  //     console.log(res);
  //     console.log(res.status);
  //     try {
  //       let data;
  //       data = res.blob();
  //       fs.writeFileSync("test1.jpg", data, {
  //         encoding: "base64",
  //       });
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   })
  //   .catch((err) => {
  //     console.log("======failure=======");
  //     console.log(err);
  //   });
};
