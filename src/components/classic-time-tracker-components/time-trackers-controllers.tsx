"use client";

import { Session } from "next-auth";

import { storeTimerSession } from "@/actions/timer-action";
import { useTimer } from "@/hooks/useTimer";

import {
  onMountTimer,
  setTaskName,
  start,
  stop,
  toggleTimerTag,
} from "@/redux/slices/timerSlice";
import { addToTable } from "@/redux/slices/timerTableSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useTags } from "@/hooks/useTags";
import { ChangeEvent, useCallback } from "react";
import { incrementTick } from "@/redux/slices/timerSlice";
import { useToast } from "../ui/use-toast";
import { TagsPicker } from "../shared/tags-picker";
import ProjectsPicker from "../projects-picker";

interface TimeTrackerControllersProps {
  session: Session | null;
}

export const TimeTrackerControllers = ({
  session,
}: TimeTrackerControllersProps) => {
  const dispatch = useAppDispatch();
  const tags = useTags(session?.user?.id || "");
  const { toast } = useToast();

  //
  const { startDate, totalTicks, taskName, selectedTags } = useAppSelector(
    (state) => state.timerReducer
  );
  const selectedProjectId = useAppSelector(
    (state) => state.timeSessionRecordSlice.project
  );

  useTimer({
    isOn: !!startDate,
    cb: () => {
      dispatch(incrementTick(1000));
    },
    options: {
      cbOnMount: useCallback(() => {
        dispatch(onMountTimer());
      }, [dispatch]),
    },
  });

  const onStop = async () => {
    if (!session?.user?.id) {
      return;
    }

    const response = await storeTimerSession({
      totalTicks,
      userId: session?.user?.id,
      taskName,
      selectedTags,
      projectId: selectedProjectId,
      date: new Date(),
    });

    return response;
  };

  return (
    <section className="flex gap-x-5 w-full">
      <Input
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          dispatch(setTaskName(e.target.value));
        }}
        value={taskName}
        type="text"
        name="taskName"
        className="w-full"
        placeholder="Enter the task name"
      />

      <TagsPicker
        selectedTags={selectedTags}
        tags={tags}
        onClickCb={(_id: string) => {
          dispatch(toggleTimerTag(_id));
        }}
        label="Select Tags"
      />

      {/* projects picker */}
      <ProjectsPicker _id={session?.user?.id} className="w-50" />

      <Button
        variant="default"
        className="cursor-pointer"
        asChild
        onClick={() => {
          if (startDate) {
            onStop()
              .then((response) => {
                if (response !== undefined) {
                  dispatch(stop());
                  dispatch(addToTable(response));
                }
              })
              .catch((error) => {
                toast({
                  title: "Error with saving your results",
                  description: error.message,
                });
              });
          } else {
            dispatch(start());
          }
        }}
      >
        <span> {!startDate ? "Start" : "Finish"}</span>
      </Button>
    </section>
  );
};
