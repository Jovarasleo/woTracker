import { Button, Stack } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useFinishTimeForm } from "../../hooks/workoutSession/useFinishTimeForm";
import { type WorkoutSession } from "../../store/db";
import { formatTime } from "../../utils/dates";
import { t } from "../../i18n/translations";

interface Props {
  session: WorkoutSession;
  onCancel: () => void;
  onSave: (finishedAt: string) => Promise<void>;
}

export function FinishTimeForm({ session, onCancel, onSave }: Props) {
  const { register, onSubmit, errors, isSubmitting, timeRules } =
    useFinishTimeForm(session);

  return (
    <form noValidate onSubmit={onSubmit(onSave)}>
      <Stack>
        <TimeInput
          {...register("time", timeRules)}
          label={t.session.finishTime}
          description={t.session.startedAt(formatTime(session.date))}
          error={errors.time?.message}
          data-autofocus
        />
        <div className="flex justify-end gap-3">
          <Button variant="default" onClick={onCancel} disabled={isSubmitting}>
            {t.common.cancel}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {t.common.save}
          </Button>
        </div>
      </Stack>
    </form>
  );
}
