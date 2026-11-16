import { Burger, Drawer, Input, SegmentedControl, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { BackupMenu } from "../backup/BackupMenu";
import { useLanguage } from "../../hooks/shared/useLanguage";
import { LANGUAGES, t } from "../../i18n/translations";

export function SidePanel() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (value: string) => {
    const option = LANGUAGES.find((candidate) => candidate.value === value);

    if (option) {
      setLanguage(option.value);
    }
  };

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
          <Input.Wrapper label={t.sidePanel.language}>
            <SegmentedControl
              fullWidth
              mt={4}
              data={LANGUAGES}
              value={language}
              onChange={handleLanguageChange}
            />
          </Input.Wrapper>
        </Stack>
      </Drawer>
    </>
  );
}
