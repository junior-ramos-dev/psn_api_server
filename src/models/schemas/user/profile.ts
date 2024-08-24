import mongoose, { Schema } from "mongoose";

import {
  IAvatarURL,
  IConsoleAvailability,
  IPersonalDetail,
  IPresence,
  IUserProfile,
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

const ProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      index: true,
    },
    onlineId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accountId: {
      type: String,
      required: true,
      unique: true,
    },
    npId: {
      type: String,
      required: true,
      unique: true,
    },
    avatarUrls: {
      type: [AvatarURLSchema],
      default: [],
    },
    plus: {
      type: Number,
      required: true,
    },
    aboutMe: {
      type: String,
      default: "",
    },
    languagesUsed: {
      type: [String],
      default: [],
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
      default: {},
    },
    personalDetailSharing: {
      type: String,
      default: "",
    },
    personalDetailSharingRequestMessageFlag: {
      type: Boolean,
      required: true,
    },
    primaryOnlineStatus: {
      type: String,
      default: "",
    },
    presences: {
      type: [PresenceSchema],
      default: [],
    },
    friendRelation: {
      type: String,
      default: "",
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
      default: {},
    },
    createdAt: {
      type: Date,
      required: true,
    },
    updatedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", ProfileSchema);

export { UserProfile };
