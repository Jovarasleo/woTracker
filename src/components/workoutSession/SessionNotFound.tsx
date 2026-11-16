import { Button, Card, Stack, Text } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { t } from "../../i18n/translations";

/** Shown when a session page's id has no session, e.g. after it was deleted. */
export function SessionNotFound() {
  return (
    <Card>
      <Stack align="flex-start">
        <Text>{t.session.notFound}</Text>
        <Button
          component={Link}
          to="/"
          variant="default"
          leftSection={<IconHome size={18} />}
        >
          {t.common.goHome}
        </Button>
      </Stack>
    </Card>
  );
}
