import { Button, Menu } from "@mantine/core";
import {
  IconAlarm,
  IconHourglassHigh,
  IconPlayerStop,
  IconPlus,
} from "@tabler/icons-react";
import { t } from "../../i18n/translations";

const REST_OPTIONS = [60, 90, 120, 180] as const;
const EXTEND_OPTIONS = [15, 30] as const;

interface Props {
  remainingSeconds: number | null;
  finished: boolean;
  onStart: (seconds: number) => void;
  onAdd: (seconds: number) => void;
  onStop: () => void;
}

/** `90` → `"1:30"`. */
const formatSeconds = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export function RestTimerButton({
  remainingSeconds,
  finished,
  onStart,
  onAdd,
  onStop,
}: Props) {
  const running = remainingSeconds !== null;

  const label = running
    ? formatSeconds(remainingSeconds)
    : finished
      ? t.restTimer.restOver
      : t.restTimer.rest;

  return (
    <Menu position="top-end" withinPortal>
      <Menu.Target>
        <Button
          variant={finished ? "light" : "default"}
          color={finished ? "green" : undefined}
          leftSection={
            finished ? <IconAlarm size={16} /> : <IconHourglassHigh size={16} />
          }
          aria-label={
            running
              ? t.restTimer.runningLabel(formatSeconds(remainingSeconds))
              : finished
                ? t.restTimer.finishedLabel
                : t.restTimer.startLabel
          }
          className="tabular-nums"
        >
          {label}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {running ? (
          <>
            {EXTEND_OPTIONS.map((seconds) => (
              <Menu.Item
                key={seconds}
                leftSection={<IconPlus size={16} />}
                onClick={() => onAdd(seconds)}
              >
                {t.restTimer.addSeconds(seconds)}
              </Menu.Item>
            ))}
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconPlayerStop size={16} />}
              onClick={onStop}
            >
              {t.restTimer.stop}
            </Menu.Item>
          </>
        ) : (
          <>
            <Menu.Label>{t.restTimer.restFor}</Menu.Label>
            {REST_OPTIONS.map((seconds) => (
              <Menu.Item key={seconds} onClick={() => onStart(seconds)}>
                {formatSeconds(seconds)}
              </Menu.Item>
            ))}
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
