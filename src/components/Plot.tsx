import {
  Card,
  CardActionArea,
  CardMedia,
  Dialog,
  DialogContent,
  DialogContentText,
  Typography,
} from "@mui/material";
import { useState } from "react";

import type {PlotLink} from "../types/PowerProfile";

export const Plot = ({ link }: { link: PlotLink }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Card onClick={handleOpen}>
        <CardActionArea>
          <Typography
            gutterBottom
            variant="subtitle1"
            component="div"
            sx={{ paddingLeft: '20px' }}
          >
            {link.label}
          </Typography>
          <CardMedia
            component="img"
            height="300"
            image={link.url}
            alt={link.label}
          />
        </CardActionArea>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <DialogContentText>
            <img src={link.url} alt={`Plot ${link.label}`} style={{ maxWidth: "100%" }} />
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
};
