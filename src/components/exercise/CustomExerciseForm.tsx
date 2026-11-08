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

const KIND_OPTIONS: { label: string; value: ExerciseKind }[] = [
  { label: "Strength", value: "strength" },
  { label: "Cardio", value: "cardio" },
];

const KIND_DESCRIPTIONS: Record<ExerciseKind, string> = {
  strength: "Logged as sets of weight × reps",
  cardio: "Logged as duration and distance",
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
      ? "An exercise with this name is already in the library"
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
        label="Exercise name"
        required
        value={name}
        error={nameError}
        onChange={(e) => setName(e.currentTarget.value)}
      />

      <Input.Wrapper label="Type" description={KIND_DESCRIPTIONS[kind]}>
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
        label="Primary muscle"
        placeholder="Optional"
        data={muscleOptions}
        value={primaryMuscle}
        onChange={setPrimaryMuscle}
        searchable
        clearable
        classNames={{ option: "capitalize", input: "capitalize" }}
      />

      <TextInput
        label="Equipment"
        placeholder={
          kind === "cardio"
            ? "Optional, e.g. treadmill"
            : "Optional, e.g. dumbbell"
        }
        value={equipment}
        onChange={(e) => setEquipment(e.currentTarget.value)}
      />

      <Textarea
        label="Description"
        placeholder="Optional notes on how to perform it"
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
          Create & add
        </Button>
      </Group>
    </Stack>
  );
}
