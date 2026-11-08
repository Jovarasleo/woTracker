import { Button, Menu } from "@mantine/core";
import {
  IconAlarm,
  IconHourglassHigh,
  IconPlayerStop,
  IconPlus,
} from "@tabler/icons-react";

/** Rest lengths offered when starting the timer, in seconds. */
const REST_OPTIONS = [60, 90, 120, 180] as const;
/** Time that can be added while it runs, in seconds. */
const EXTEND_OPTIONS = [15, 30] as const;

interface Props {
  /** Seconds left while running, `null` when idle. */
  remainingSeconds: number | null;
  /** The rest just ran out. */
  finished: boolean;
  onStart: (seconds: number) => void;
  onAdd: (seconds: number) => void;
  onStop: () => void;
}

/** `90` → `"1:30"`. */
const formatSeconds = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/**
 * Rest timer control for the session's navigation bar. Idle: pick a rest
 * length. Running: shows the countdown; the menu adds time or stops it.
 */
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
      ? "Rest over"
      : "Rest";

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
              ? `Rest timer, ${formatSeconds(remainingSeconds)} left`
              : finished
                ? "Rest over, start another rest timer"
                : "Start rest timer"
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
                {seconds} s
              </Menu.Item>
            ))}
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconPlayerStop size={16} />}
              onClick={onStop}
            >
              Stop
            </Menu.Item>
          </>
        ) : (
          <>
            <Menu.Label>Rest for</Menu.Label>
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
