import { MongooseError, Types } from "mongoose";

import { PSN_AUTH } from "@/controllers/authController";
import { User, UserProfile } from "@/models/schemas/user";

import { getPsnUserProfileByUsername } from "../psnApi/user";

/**
 * Create Db User And Profile
 *
 * @param psnOnlineId
 * @param email
 * @param password
 * @returns
 */
export const createDbUserAndProfile = async (
  psnOnlineId: string,
  email: string,
  password: string
) => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    const opts = { session };
    const userDb = await new User({
      psnOnlineId,
      email,
      password,
    }).save(opts);

    // Get the credentials used by psn_api
    const { accessToken } = PSN_AUTH.getCredentials();

    const userPsnProfile = await getPsnUserProfileByUsername(
      accessToken,
      psnOnlineId
    );

    console.log(userPsnProfile.profile.aboutMe);

    const userId = userDb._id;
    const createdAt = new Date();
    const updatedAt = new Date();

    const userProfile = {
      userId,
      ...userPsnProfile.profile,
      createdAt,
      updatedAt,
    };

    console.log(userProfile);

    const userProfileDb = await new UserProfile(userProfile).save(opts);

    await session.commitTransaction();
    session.endSession();
    return { userDb, userProfileDb };
  } catch (error) {
    // If an error occurred, abort the whole transaction and
    // undo any changes that might have happened
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Create an User on DB
 *
 * @param psnOnlineId
 * @param email
 * @param password
 * @returns
 */
export const createDbUser = async (
  psnOnlineId: string,
  email: string,
  password: string
) => {
  let user = undefined;

  try {
    user = await User.create({
      psnOnlineId,
      email,
      password,
    });
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
    }
  }
  return user;
};

/**
 * Create an User Profile on DB
 *
 * @param userId
 * @param psnOnlineId
 * @returns
 */
export const createDbUserProfile = async (
  userId: Types.ObjectId,
  psnOnlineId: string
) => {
  let userDbProfile = undefined;

  try {
    // Get the credentials used by psn_api
    const { accessToken } = PSN_AUTH.getCredentials();

    const userPsnProfile = await getPsnUserProfileByUsername(
      accessToken,
      psnOnlineId
    );

    userDbProfile = await UserProfile.create({ userId, ...userPsnProfile });
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
    }
  }
  return userDbProfile;
};
