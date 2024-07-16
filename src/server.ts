import dotenv from "dotenv";
dotenv.config();

const PORT = parseInt(`${process.env.PORT ?? 3000}`);

import appTest from "./appTest";
// import { appTest } from "./appTest";

appTest.listen(PORT, () => console.log(`Server is running at ${PORT}.`));
// appTest.listen(PORT, () => console.log(`Server is running at ${PORT}.`));
