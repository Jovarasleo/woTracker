import { Burger, Drawer, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { BackupMenu } from "../backup/BackupMenu";

export function SidePanel() {
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <>
      <Burger
        opened={opened}
        onClick={toggle}
        aria-label={opened ? "Close menu" : "Open menu"}
      />
      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="xs"
        title="Menu"
      >
        <Stack>
          <BackupMenu />
        </Stack>
      </Drawer>
    </>
  );
}
