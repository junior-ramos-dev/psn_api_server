import * as fs from "fs";
import axios, { AxiosResponse } from "axios";

//TODOCustomize params to download diferent types of files
export const dolwnloadFileToBase64 = async (
  imageUrl: string
): Promise<string> => {
  let data: string = "";
  let count = 1;

  await axios
    .get(imageUrl, {
      responseType: "text",
      responseEncoding: "base64",
    })
    .then((res: AxiosResponse) => {
      // console.log(res);
      console.log("[success]");

      data = res.data;
    })
    .catch((err) => {
      console.log("[failure]");
      console.log(err);
    });
  return data;
};

//TODO Change params to required
//TODOCustomize params to download diferent types of files
export const dolwnloadImgToDisk = async (
  imageUrl: string,
  filePath?: string,
  fileName?: string
) => {
  await axios
    .get(imageUrl, {
      responseType: "text",
      responseEncoding: "base64",
    })
    .then((res) => {
      console.log(res);
      console.log("[success]");
      try {
        let data;
        data = res.data;
        fs.writeFileSync(`${filePath}${fileName}`, JSON.stringify(res.data), {
          encoding: "base64",
        });
      } catch (err) {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log("failure]");
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
