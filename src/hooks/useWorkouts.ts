import { useLiveQuery } from "dexie-react-hooks";
import { db, type WorkoutSession } from "../store/db";

export const useWorkouts = () => {
  const workouts = useLiveQuery(() => db.workoutSessions?.toArray(), []);

  const addWorkout = async (w: WorkoutSession) => {
    await db.workoutSessions.add(w);
  };

  return { workouts, addWorkout };
};
