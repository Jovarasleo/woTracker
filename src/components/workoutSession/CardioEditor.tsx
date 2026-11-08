import { ActionIcon, Group, NumberInput, Text } from "@mantine/core";
import { IconCheck, IconEdit } from "@tabler/icons-react";
import { type CardioMetrics } from "../../store/db";
import { formatPace } from "../../utils/cardio";

interface Props {
  metrics: CardioMetrics;
  disabled: boolean;
  onToggleEdit: () => void;
  onChange: (changes: CardioMetrics) => void;
}

interface FieldConfig {
  key: keyof CardioMetrics;
  /** Visible label, which is also the accessible name. */
  label: string;
  decimalScale?: number;
  min: number;
  max?: number;
}

const MAIN_FIELDS: FieldConfig[] = [
  {
    key: "durationMinutes",
    label: "Duration (min)",
    decimalScale: 1,
    min: 0,
  },
  {
    key: "distanceKm",
    label: "Distance (km)",
    decimalScale: 2,
    min: 0,
  },
];

const EXTRA_FIELDS: FieldConfig[] = [
  { key: "calories", label: "kcal", min: 0 },
  { key: "avgHeartRate", label: "HR (bpm)", min: 0, max: 250 },
  { key: "rpe", label: "RPE (1–10)", min: 1, max: 10 },
];

/** Empty input clears the value instead of saving 0. */
const toOptionalNumber = (value: number | string) =>
  value === "" ? undefined : Number(value);

/**
 * Inputs for a cardio exercise: duration and distance (with the calculated
 * pace), then calories, average heart rate and RPE. Locked until the edit
 * button is pressed, like a strength set row.
 */
export function CardioEditor({
  metrics,
  disabled,
  onToggleEdit,
  onChange,
}: Props) {
  const pace = formatPace(metrics);

  const renderField = (field: FieldConfig) => (
    <NumberInput
      key={field.key}
      className="min-w-0 flex-1"
      label={field.label}
      labelProps={{ className: "block truncate text-left" }}
      value={metrics[field.key] ?? ""}
      min={field.min}
      max={field.max}
      clampBehavior={field.max ? "strict" : "blur"}
      allowDecimal={field.decimalScale !== undefined}
      decimalScale={field.decimalScale}
      hideControls
      disabled={disabled}
      placeholder="–"
      onChange={(value) => onChange({ [field.key]: toOptionalNumber(value) })}
    />
  );

  return (
    <>
      <Group gap="xs" wrap="nowrap" align="flex-end">
        {MAIN_FIELDS.map(renderField)}
        <ActionIcon
          variant="subtle"
          size="lg"
          mb={2}
          aria-label={disabled ? "Edit cardio" : "Confirm cardio"}
          onClick={onToggleEdit}
        >
          {disabled ? <IconEdit size={18} /> : <IconCheck size={18} />}
        </ActionIcon>
      </Group>

      <Group gap="xs" wrap="nowrap" align="flex-end">
        {EXTRA_FIELDS.map(renderField)}
        <div className="w-8.5 shrink-0" />
      </Group>

      {pace && (
        <Text size="xs" c="dimmed" className="text-left">
          Pace {pace}
        </Text>
      )}
    </>
  );
}
