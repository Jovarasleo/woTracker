import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { type WorkoutSession } from "../../store/db";
import { formatTime } from "../../utils/dates";
import { finishTimeFrom } from "../../utils/sessionStatus";
import { t } from "../../i18n/translations";

interface FinishTimeValues {
  time: string;
}

export function useFinishTimeForm(session: WorkoutSession) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FinishTimeValues>({
    defaultValues: {
      time: session.finishedAt ? formatTime(session.finishedAt) : "",
    },
  });

  const timeRules = {
    required: t.session.errors.finishTimeRequired,
    validate: (time: string) =>
      !finishTimeFrom(session, time).isAfter(dayjs()) ||
      t.session.errors.finishTimeInFuture,
  };

  const onSubmit = (onValid: (finishedAt: string) => Promise<void>) =>
    handleSubmit(({ time }) =>
      onValid(finishTimeFrom(session, time).toISOString()),
    );

  return { register, onSubmit, errors, isSubmitting, timeRules };
}
