import { Button, Card, Stack, Text } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { t } from "../../i18n/translations";

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
