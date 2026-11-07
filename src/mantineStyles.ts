/**
 * Mantine CSS for only the components this app uses, instead of
 * `@mantine/core/styles.css` (every component, ~2× the size). The stylesheet
 * blocks the first paint, so keep it small.
 *
 * When you use a Mantine component that isn't listed here, add its CSS file
 * (`@mantine/core/styles/<Component>.css`) or it renders unstyled. Some
 * components also need the CSS of the components they are built from (e.g.
 * Select → Input, Combobox, Popover, ScrollArea); those go in the
 * "Dependencies" group, which must stay above the components using them.
 */

// Foundations: reset, theme CSS variables, global styles.
import "@mantine/core/styles/baseline.css";
import "@mantine/core/styles/default-css-variables.css";
import "@mantine/core/styles/global.css";

// Dependencies: building blocks of the components below.
import "@mantine/core/styles/UnstyledButton.css";
import "@mantine/core/styles/VisuallyHidden.css";
import "@mantine/core/styles/Paper.css";
import "@mantine/core/styles/Loader.css";
import "@mantine/core/styles/CloseButton.css";
import "@mantine/core/styles/Overlay.css";
import "@mantine/core/styles/ModalBase.css";
import "@mantine/core/styles/Popover.css";
import "@mantine/core/styles/ScrollArea.css";
import "@mantine/core/styles/Input.css";
import "@mantine/core/styles/Combobox.css";
import "@mantine/core/styles/FloatingIndicator.css";

// Components used directly by the app.
import "@mantine/core/styles/ActionIcon.css";
import "@mantine/core/styles/Badge.css";
import "@mantine/core/styles/Button.css";
import "@mantine/core/styles/Card.css";
import "@mantine/core/styles/ColorPicker.css";
import "@mantine/core/styles/ColorSwatch.css";
import "@mantine/core/styles/Divider.css";
import "@mantine/core/styles/Group.css";
import "@mantine/core/styles/Image.css";
import "@mantine/core/styles/Indicator.css";
import "@mantine/core/styles/List.css";
import "@mantine/core/styles/Menu.css";
import "@mantine/core/styles/Modal.css";
import "@mantine/core/styles/NumberInput.css";
import "@mantine/core/styles/SegmentedControl.css";
import "@mantine/core/styles/SimpleGrid.css";
import "@mantine/core/styles/Skeleton.css";
import "@mantine/core/styles/Stack.css";
import "@mantine/core/styles/Tabs.css";
import "@mantine/core/styles/Text.css";
import "@mantine/core/styles/ThemeIcon.css";
import "@mantine/core/styles/Title.css";
import "@mantine/core/styles/Tooltip.css";

// @mantine/dates (Calendar on the home page).
import "@mantine/dates/styles.css";
