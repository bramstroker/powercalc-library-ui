import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import { Button, Stack, Typography } from "@mui/material";

export const SUPPORT_POWERCALC_URL = "https://buymeacoffee.com/bramski";

type SupportPowercalcButtonProps = {
  fullWidth?: boolean;
  size?: "small" | "medium";
  subtle?: boolean;
};

/** A project-focused CTA that still makes its external destination clear. */
export const SupportPowercalcButton = ({
  fullWidth = false,
  size = "medium",
  subtle = false,
}: SupportPowercalcButtonProps) => (
  <Button
    component="a"
    href={SUPPORT_POWERCALC_URL}
    target="_blank"
    rel="noopener noreferrer"
    variant={subtle ? "outlined" : "contained"}
    size={size}
    fullWidth={fullWidth}
    startIcon={<LocalCafeIcon />}
    sx={
      subtle
        ? {
            color: "text.primary",
            borderColor: "divider",
            fontWeight: 700,
            "&:hover": { borderColor: "text.secondary", bgcolor: "action.hover" },
          }
        : {
            bgcolor: "#ffdd00",
            color: "#1f1f1f",
            boxShadow: "none",
            fontWeight: 700,
            "&:hover": { bgcolor: "#f2ca00", boxShadow: "none" },
          }
    }
  >
    Support Powercalc
  </Button>
);

/** A compact reminder that can sit inside an existing profile sidebar card. */
export const SupportPowercalcPrompt = () => (
  <Stack component="aside" spacing={0.75} aria-labelledby="support-powercalc-title">
    <Typography id="support-powercalc-title" component="h2" variant="overline">
      Support Powercalc
    </Typography>
    <Typography variant="caption" color="text.secondary">
      Help cover hosting and measurement hardware.
    </Typography>
    <SupportPowercalcButton fullWidth size="small" />
  </Stack>
);
