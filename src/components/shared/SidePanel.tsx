import { Burger, Drawer, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { BackupMenu } from "../backup/BackupMenu";
import { t } from "../../i18n/translations";

export function SidePanel() {
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <>
      <Burger
        opened={opened}
        onClick={toggle}
        aria-label={opened ? t.sidePanel.close : t.sidePanel.open}
      />
      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="xs"
        title={t.sidePanel.title}
      >
        <Stack>
          <BackupMenu />
        </Stack>
      </Drawer>
    </>
  );
}
