import { MongooseError, Types } from "mongoose";

import { PSN_AUTH } from "@/controllers/authController";
import { IUserAndProfile } from "@/models/interfaces/user";
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
): Promise<IUserAndProfile | MongooseError> => {
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

    const userId = userDb._id;
    const createdAt = new Date();
    const updatedAt = new Date();

    const userProfile = {
      userId,
      ...userPsnProfile.profile,
      createdAt,
      updatedAt,
    };

    const userProfileDb = await new UserProfile(userProfile).save(opts);

    const data: IUserAndProfile = { userDb, userProfileDb };

    await session.commitTransaction();
    session.endSession();

    return data;
  } catch (error: unknown) {
    // If an error occurred, abort the whole transaction and
    // undo any changes that might have happened
    await session.abortTransaction();
    session.endSession();
    console.log(error);

    return error as MongooseError;
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
  try {
    const user = await User.create({
      psnOnlineId,
      email,
      password,
    });
    return user;
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
      return error;
    }
  }
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
  try {
    // Get the credentials used by psn_api
    const { accessToken } = PSN_AUTH.getCredentials();
    const userPsnProfile = await getPsnUserProfileByUsername(
      accessToken,
      psnOnlineId
    );

    const userDbProfile = await UserProfile.create({
      userId,
      ...userPsnProfile,
    });

    return userDbProfile;
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
      return error;
    }
  }
};

/**
 * Get the user data from DB
 *
 * @param userId
 * @returns
 */
export const getDbUser = async (userId: Types.ObjectId) => {
  try {
    const user = await User.findById({
      userId: userId,
    });

    return user;
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
      return error;
    }
  }
};

/**
 * Get the user profile data from DB
 *
 * @param userId
 * @returns
 */
export const getDbUserProfile = async (userId: Types.ObjectId) => {
  try {
    const userProfile = await UserProfile.findById({
      userId: userId,
    });

    return userProfile;
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
      return error;
    }
  }
};
