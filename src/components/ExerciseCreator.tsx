import {
  Badge,
  Button,
  Group,
  Image,
  ScrollArea,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBarbell,
  IconChevronRight,
  IconPlus,
  IconRun,
  IconSearch,
} from "@tabler/icons-react";
import { useDeferredValue, useState } from "react";
import {
  fromCatalogExercise,
  fromCustomExercise,
  matchesExerciseQuery,
  type LibraryExercise,
} from "../data/exerciseCatalog";
import { type CustomExerciseDraft } from "../hooks/useCustomExercises";
import { useExerciseCatalog } from "../hooks/useExerciseCatalog";
import { type CustomExercise } from "../store/db";
import { CardioBadge } from "./CardioBadge";
import { CustomExerciseForm } from "./CustomExerciseForm";
import { ExerciseDetails } from "./ExerciseDetails";
import { ExerciseRowSkeleton } from "./ExerciseRowSkeleton";

const MAX_VISIBLE_RESULTS = 50;
/** Name widths of the placeholder rows shown while the library loads. */
const PLACEHOLDER_NAME_WIDTHS = ["55%", "40%", "65%", "45%", "50%", "35%"];

interface Props {
  customExercises: CustomExercise[] | undefined;
  onSelectExercise: (exercise: LibraryExercise) => void;
  onCreateCustomExercise: (draft: CustomExerciseDraft) => void;
}

/**
 * Lets the user pick an exercise from the built-in library (with description
 * and example pictures) or their own custom exercises, or create a new one.
 */
export function ExerciseCreator({
  customExercises,
  onSelectExercise,
  onCreateCustomExercise,
}: Props) {
  const catalog = useExerciseCatalog();
  const [tab, setTab] = useState<"library" | "custom">("library");
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<string | null>(null);
  const [selected, setSelected] = useState<LibraryExercise | null>(null);
  const deferredQuery = useDeferredValue(query);

  // Tabs, search and the custom form don't need the data, so they render right
  // away; only the result list shows placeholders while it loads.
  const loading = !catalog || !customExercises;
  const library = [
    ...(customExercises ?? []).map(fromCustomExercise),
    ...(catalog ?? []).map(fromCatalogExercise),
  ];
  const muscleOptions = [
    ...new Set(library.flatMap((exercise) => exercise.primaryMuscles)),
  ].sort();
  const results = library.filter(
    (exercise) =>
      (!muscle || exercise.primaryMuscles.includes(muscle)) &&
      matchesExerciseQuery(exercise, deferredQuery),
  );
  const visibleResults = results.slice(0, MAX_VISIBLE_RESULTS);
  const takenNames = new Set(
    library.map((exercise) => exercise.name.toLowerCase()),
  );

  const isNameTaken = (name: string) => takenNames.has(name.toLowerCase());

  if (selected) {
    return (
      <ExerciseDetails
        exercise={selected}
        onBack={() => setSelected(null)}
        onAdd={onSelectExercise}
      />
    );
  }

  return (
    <Tabs
      value={tab}
      onChange={(value) => setTab(value === "custom" ? "custom" : "library")}
    >
      <Tabs.List grow className="mb-4">
        <Tabs.Tab value="library" leftSection={<IconSearch size={16} />}>
          Library
        </Tabs.Tab>
        <Tabs.Tab value="custom" leftSection={<IconPlus size={16} />}>
          Custom
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="library">
        <Stack gap="xs">
          <Group gap="xs" wrap="nowrap">
            <TextInput
              className="flex-1"
              placeholder="Search exercises"
              leftSection={<IconSearch size={16} />}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              data-autofocus
            />
            <Select
              className="w-36"
              placeholder="All muscles"
              data={muscleOptions}
              value={muscle}
              onChange={setMuscle}
              searchable
              clearable
              classNames={{ option: "capitalize", input: "capitalize" }}
            />
          </Group>

          <ScrollArea.Autosize mah="55vh" offsetScrollbars>
            <Stack gap={4} aria-busy={loading}>
              {loading &&
                PLACEHOLDER_NAME_WIDTHS.map((width, index) => (
                  <ExerciseRowSkeleton key={index} nameWidth={width} />
                ))}

              {visibleResults.map((exercise) => (
                <UnstyledButton
                  key={exercise.key}
                  className="flex items-center gap-3 rounded-md p-2 text-left hover:bg-white/5"
                  onClick={() => setSelected(exercise)}
                >
                  {exercise.imageUrls[0] ? (
                    <Image
                      src={exercise.imageUrls[0]}
                      alt=""
                      w={48}
                      h={48}
                      radius="sm"
                      fit="cover"
                      loading="lazy"
                      className="shrink-0"
                    />
                  ) : (
                    <ThemeIcon
                      size={48}
                      radius="sm"
                      variant="light"
                      className="shrink-0"
                    >
                      {exercise.kind === "cardio" ? (
                        <IconRun size={24} />
                      ) : (
                        <IconBarbell size={24} />
                      )}
                    </ThemeIcon>
                  )}
                  <div className="min-w-0 flex-1">
                    <Text size="sm" fw={500} truncate>
                      {exercise.name}
                    </Text>
                    <Text size="xs" c="dimmed" truncate className="capitalize">
                      {[exercise.primaryMuscles.join(", "), exercise.equipment]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  </div>
                  <CardioBadge kind={exercise.kind} />
                  {exercise.source === "custom" && (
                    <Badge size="xs" variant="light">
                      Custom
                    </Badge>
                  )}
                  <IconChevronRight size={16} className="shrink-0 opacity-50" />
                </UnstyledButton>
              ))}
            </Stack>
          </ScrollArea.Autosize>

          {results.length > MAX_VISIBLE_RESULTS && (
            <Text size="xs" c="dimmed">
              Showing {MAX_VISIBLE_RESULTS} of {results.length} — refine your
              search to see more
            </Text>
          )}

          {!loading && results.length === 0 && (
            <Stack gap="xs" align="center" className="py-4">
              <Text size="sm" c="dimmed">
                No exercises found
              </Text>
              <Button
                variant="light"
                leftSection={<IconPlus size={18} />}
                onClick={() => setTab("custom")}
              >
                Create custom exercise
              </Button>
            </Stack>
          )}
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="custom">
        <CustomExerciseForm
          key={query}
          initialName={query.trim()}
          muscleOptions={muscleOptions}
          isNameTaken={isNameTaken}
          onSubmit={onCreateCustomExercise}
        />
      </Tabs.Panel>
    </Tabs>
  );
}
