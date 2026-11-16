import {
  Button,
  Group,
  Input,
  SegmentedControl,
  Select,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { type CustomExerciseDraft } from "../../hooks/exercise/useCustomExercises";
import { type ExerciseKind } from "../../store/db";
import { t } from "../../i18n/translations";

const KIND_OPTIONS: { label: string; value: ExerciseKind }[] = [
  { label: t.common.strength, value: "strength" },
  { label: t.common.cardio, value: "cardio" },
];

const KIND_DESCRIPTIONS: Record<ExerciseKind, string> = {
  strength: t.exercise.form.strengthDescription,
  cardio: t.exercise.form.cardioDescription,
};

interface Props {
  initialName: string;
  muscleOptions: string[];
  isNameTaken: (name: string) => boolean;
  onSubmit: (draft: CustomExerciseDraft) => void;
}

export function CustomExerciseForm({
  initialName,
  muscleOptions,
  isNameTaken,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialName);
  const [kind, setKind] = useState<ExerciseKind>("strength");
  const [primaryMuscle, setPrimaryMuscle] = useState<string | null>(null);
  const [equipment, setEquipment] = useState("");
  const [description, setDescription] = useState("");

  const trimmedName = name.trim();
  const nameError =
    trimmedName && isNameTaken(trimmedName)
      ? t.exercise.form.nameTaken
      : null;
  const canSubmit = Boolean(trimmedName) && !nameError;

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit({
      name: trimmedName,
      kind,
      primaryMuscle: primaryMuscle ?? undefined,
      equipment: equipment.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <Stack>
      <TextInput
        label={t.exercise.form.name}
        required
        value={name}
        error={nameError}
        onChange={(e) => setName(e.currentTarget.value)}
      />

      <Input.Wrapper label={t.exercise.form.type} description={KIND_DESCRIPTIONS[kind]}>
        <SegmentedControl
          fullWidth
          mt={4}
          data={KIND_OPTIONS}
          value={kind}
          onChange={(value) =>
            setKind(value === "cardio" ? "cardio" : "strength")
          }
        />
      </Input.Wrapper>

      <Select
        label={t.exercise.form.primaryMuscle}
        placeholder={t.exercise.form.optional}
        data={muscleOptions}
        value={primaryMuscle}
        onChange={setPrimaryMuscle}
        searchable
        clearable
        classNames={{ option: "capitalize", input: "capitalize" }}
      />

      <TextInput
        label={t.exercise.form.equipment}
        placeholder={
          kind === "cardio"
            ? t.exercise.form.equipmentCardioPlaceholder
            : t.exercise.form.equipmentStrengthPlaceholder
        }
        value={equipment}
        onChange={(e) => setEquipment(e.currentTarget.value)}
      />

      <Textarea
        label={t.exercise.form.description}
        placeholder={t.exercise.form.descriptionPlaceholder}
        autosize
        minRows={3}
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
      />

      <Group justify="flex-end">
        <Button
          leftSection={<IconPlus size={18} />}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {t.exercise.form.submit}
        </Button>
      </Group>
    </Stack>
  );
}
