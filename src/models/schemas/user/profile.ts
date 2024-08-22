import mongoose, { Schema } from "mongoose";

import {
  IAvatarURL,
  IConsoleAvailability,
  IPersonalDetail,
  IPresence,
  IProfile,
} from "@/models/interfaces/user";

import { TrophySummary } from "../trophy";

const AvatarURLSchema = new Schema<IAvatarURL>({
  size: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    required: true,
  },
});

const PersonalDetailSchema = new Schema<IPersonalDetail>({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
});

const PresenceSchema = new Schema<IPresence>({
  onlineStatus: {
    type: String,
    required: true,
  },
  hasBroadcastData: {
    type: Boolean,
    required: true,
  },
  lastOnlineDate: {
    type: Date,
    required: true,
  },
});

const ConsoleAvailabilitySchema = new Schema<IConsoleAvailability>({
  availabilityStatus: {
    type: String,
    required: true,
  },
});

const ProfileSchema = new Schema<IProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  onlineId: {
    type: String,
    required: true,
  },
  accountId: {
    type: String,
    required: true,
  },
  npId: {
    type: String,
    required: true,
  },
  avatarUrls: {
    type: [AvatarURLSchema],
    required: true,
  },
  plus: {
    type: Number,
    required: true,
  },
  aboutMe: {
    type: String,
    required: true,
  },
  languagesUsed: {
    type: [String],
    required: true,
  },
  trophySummary: {
    type: TrophySummary,
    required: true,
  },
  isOfficiallyVerified: {
    type: Boolean,
    required: true,
  },
  personalDetail: {
    type: PersonalDetailSchema,
    required: true,
  },
  personalDetailSharing: {
    type: String,
    required: true,
  },
  personalDetailSharingRequestMessageFlag: {
    type: Boolean,
    required: true,
  },
  primaryOnlineStatus: {
    type: String,
    required: true,
  },
  presences: {
    type: [PresenceSchema],
    required: true,
  },
  friendRelation: {
    type: String,
    required: true,
  },
  requestMessageFlag: {
    type: Boolean,
    required: true,
  },
  blocking: {
    type: Boolean,
    required: true,
  },
  following: {
    type: Boolean,
    required: true,
  },
  consoleAvailability: {
    type: ConsoleAvailabilitySchema,
    required: true,
  },
});

const Profile = mongoose.model("Profile", ProfileSchema);

export { Profile };
