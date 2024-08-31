import { Types } from "mongoose";

import { servicesErrorHandler } from "@/models/interfaces/common/error";
import { IUser, IUserAndProfile, IUserProfile } from "@/models/interfaces/user";
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
): Promise<IUserAndProfile | undefined> => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    const opts = { session };
    const userDb = await new User({
      psnOnlineId,
      email,
      password,
    }).save(opts);

    // Get user profile from psn_api
    const userPsnProfile = await getPsnUserProfileByUsername(psnOnlineId);

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
    //Handle the error
    servicesErrorHandler(error);
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
): Promise<IUser | undefined> => {
  try {
    const user = await User.create({
      psnOnlineId,
      email,
      password,
    });
    return user;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
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
): Promise<IUserProfile | undefined> => {
  try {
    // Get user profile from psn_api
    const userPsnProfile = await getPsnUserProfileByUsername(psnOnlineId);

    const userDbProfile = await UserProfile.create({
      userId,
      ...userPsnProfile,
    });

    return userDbProfile;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Get the user by id from DB
 *
 * @param userId
 * @returns
 */
export const getDbUserById = async (
  userId: string
): Promise<IUser | undefined> => {
  try {
    const user = await User.findById(userId, {
      psnOnlineId: 1,
      email: 1,
      _id: 0,
    });

    return user as IUser;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Get the user by email from DB
 *
 * @param email
 * @returns
 */
export const getDbUserByEmail = async (
  email: string
): Promise<IUser | undefined> => {
  try {
    const user = await User.findOne({ email });

    return user as IUser;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Get the user by psnOnlineId from DB
 *
 * @param psnOnlineId
 * @returns
 */
export const getDbUserByPsnOnlineId = async (
  psnOnlineId: string
): Promise<IUser | undefined> => {
  try {
    const user = await User.findOne({ psnOnlineId });

    return user as IUser;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Get the user profile data from DB
 *
 * @param userId
 * @returns
 */
export const getDbUserProfileByUserId = async (
  userId: string
): Promise<IUserProfile | undefined> => {
  try {
    const userProfile = await UserProfile.findOne({
      userId: userId,
    });

    return userProfile as IUserProfile;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Update the user profile with data from psn_api
 *
 * @param userId
 * @param psnOnlineId
 * @returns
 */
export const updateDbUserProfile = async (
  userId: string,
  psnOnlineId: string
): Promise<IUserProfile | undefined> => {
  console.log(userId, psnOnlineId);

  try {
    // Get user profile from psn_api
    const userPsnProfile = await getPsnUserProfileByUsername(psnOnlineId);

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: userId },
      {
        $set: { ...userPsnProfile, updatedAt: new Date() },
      },
      {
        new: true,
        timestamps: { createdAt: false, updatedAt: true },
      }
    );

    await updatedProfile?.save();

    return updatedProfile as IUserProfile;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};
