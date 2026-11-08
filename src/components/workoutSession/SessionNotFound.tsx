import { Button, Card, Stack, Text } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

/** Shown when a session page's id has no session, e.g. after it was deleted. */
export function SessionNotFound() {
  return (
    <Card>
      <Stack align="flex-start">
        <Text>This session doesn't exist. It may have been deleted.</Text>
        <Button
          component={Link}
          to="/"
          variant="default"
          leftSection={<IconHome size={18} />}
        >
          Go to home
        </Button>
      </Stack>
    </Card>
  );
}
