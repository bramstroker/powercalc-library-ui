import { Box, Typography } from "@mui/material";

export const LibraryIntroduction = () => (
  <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
    <Typography component="h1" variant="subtitle1" sx={{ fontWeight: 700 }}>
      Find a power profile
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Use a device power profile to estimate energy use in Home Assistant. Search by brand, model,
      product name or barcode.
    </Typography>
    <Box component="details" sx={{ mt: 0.5 }}>
      <Typography
        component="summary"
        variant="body2"
        sx={{ cursor: "pointer", color: "primary.main", width: "fit-content" }}
      >
        Where can I find the model number?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 800 }}>
        Check the label on your device or its packaging. You can also find the model in Home
        Assistant under Settings → Devices &amp; services → Devices, then open your device. Search
        the model number exactly as shown, or try the barcode on the packaging. Check that the
        profile matches your exact model and variant before using it.
      </Typography>
    </Box>
  </Box>
);
