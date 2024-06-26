"use server";

import * as z from "zod";
import type { Types } from "mongoose";
import { ObjectId } from "mongodb";

import { PomodorroSettingsSchema, SettingsProfileSchema } from "@/schemas";

import { User } from "@/db/models/auth/User";
import { Settings } from "@/db/models/Settings";

import { dbConnect } from "@/lib/dbConnect";
import { IPomodorroTimerSettings, IProfileSettings } from "@/types/settings";

interface IUpdateCloudinaryProfilePhoto {
  _id: Types.ObjectId | string | undefined;
  event?: string;
  info?: any;
}
export const updateCloudinaryProfilePhoto = async ({
  event,
  info,
  _id,
}: IUpdateCloudinaryProfilePhoto): Promise<{
  url?: string;
  error?: string;
  success?: string;
}> => {
  try {
    if (!event || !info) throw new Error("The image upload failed");
    if (event !== "success") throw new Error("The image upload failed");
    if (!_id || !ObjectId.isValid(_id)) throw new Error("Try to relogin");

    const image = info.url as string;

    await dbConnect();
    await User.updateOne({ _id: new ObjectId(_id) }, { image });

    return { success: "The image was updated successfully", url: image };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
};

// updating general profile data
export const updateSettingsProfile = async (
  _id: Types.ObjectId | string,
  values: z.infer<typeof SettingsProfileSchema>
): Promise<{
  error?: string;
  success?: string;
}> => {
  try {
    const isDataValid = SettingsProfileSchema.safeParse(values);

    if (!isDataValid) return { error: "Incorrect data" };

    // data to update
    const profile = {
      ...values,
    } as IProfileSettings;

    // updating data
    await dbConnect();
    await Settings.updateOne({ createdBy: _id }, { profile });

    return { success: "Profile data was updated" };
  } catch (error) {
    return { error: "Something went wrong" };
  }
};

//
export const updatePomodorroTimeSettings = async (
  _id: Types.ObjectId | string,
  values: z.infer<typeof PomodorroSettingsSchema>
): Promise<{
  error?: string;
  success?: string;
  objToUpdate?: IPomodorroTimerSettings;
}> => {
  try {
    const isDataValid = PomodorroSettingsSchema.safeParse(values);

    if (!isDataValid)
      return {
        error: "The provided data is incorrect please enter other data",
      };

    // creating object to update
    const objToUpdate = {
      restConfig: {
        count: values.count,
        duration: {
          long: values.restLongInterval,
          short: values.restShortInterval,
        },
      },

      workConfig: {
        count: values.count,
        duration: {
          long: values.workLongInterval,
          short: values.workShortInterval,
        },
      },
    } as IPomodorroTimerSettings;

    // updating
    await dbConnect();
    await Settings.findOneAndUpdate(
      { createdBy: new ObjectId(_id) },
      { pomodorro: objToUpdate }
    );

    return { success: "Pomodorro settings data was updated", objToUpdate };
  } catch (error) {
    console.error(error);
    return { error: "The pomodorro settigns data updated was failed" };
  }
};
