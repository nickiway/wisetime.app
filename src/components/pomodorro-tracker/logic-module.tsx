"use client";

import { useTimer } from "@/hooks/useTimer";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useCallback, useEffect, useMemo } from "react";
import {
  addTick,
  addRestCounts,
  addWorkCounts,
  decreaseTicksByMount,
  onMountTimer,
  pause,
  configSettings,
} from "@/redux/slices/pomodorroTimerSlice";
import "react-circular-progressbar/dist/styles.css";
import { useSettings } from "@/hooks/useSettings";

export const PomodorroLogicModule = () => {
  const dispatch = useAppDispatch();
  const { pomodorro } = useSettings();

  useEffect(() => {
    console.log(pomodorro, "pomodorro");
    const settingsPayload = {
      restLong: pomodorro.restConfig.duration.long,
      restShort: pomodorro.restConfig.duration.short,
      workShort: pomodorro.workConfig.duration.short,
    };

    dispatch(configSettings(settingsPayload));
  }, [dispatch, pomodorro]);

  // Selecting necessary state variables
  const { workInterval, restInterval, ticks, isOn, counter } = useAppSelector(
    (state) => state.pomodorroTimerSlice
  );

  // Determining if it's time for a rest cycle
  const isRestCycle = counter.work > counter.rest;

  // Calculating the start time for ticks based on the cycle
  const startTicks = isRestCycle
    ? counter.rest === 3
      ? restInterval.long
      : restInterval.short
    : workInterval;

  // Checking if it's time to trigger a cycle
  const isTrigger = startTicks - ticks <= 0;

  // Function to execute a cycle
  const doCycle = useCallback(() => {
    dispatch(isRestCycle ? addRestCounts(1) : addWorkCounts(1));
    if (counter.work >= 4) {
      dispatch(pause());
    }

    dispatch(decreaseTicksByMount(startTicks));
  }, [dispatch, isRestCycle, counter.work, startTicks]);

  // Callback on mount
  const cbOnMount = useCallback(() => {
    dispatch(onMountTimer());
  }, [dispatch]);

  // Options for the timer
  const options = useMemo(() => {
    return { isTrigger, cbOnTrigger: doCycle, cbOnMount, timeStep: 100 };
  }, [isTrigger, doCycle, cbOnMount]);

  // Function to handle ticks
  const handleTick = useCallback(() => {
    dispatch(addTick(100));
  }, [dispatch]);

  // Using the timer effect
  useTimer({ isOn, cb: handleTick, options });

  // Returning null as this component doesn't render anything
  return null;
};
