import mongoose, { Schema } from "mongoose";

import { IProfile } from "@/models/interfaces/user/profile";

const profileSchema = new Schema<IProfile>({});

const Profile = mongoose.model("Profile", profileSchema);

export { Profile };
