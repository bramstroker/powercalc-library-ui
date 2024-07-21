import React, {useState} from 'react';
import {
    Card,
    CardActionArea,
    CardMedia,
    Dialog,
    DialogContent,
    DialogContentText,
    Typography,
    CardContent
} from '@mui/material';
import {PlotLink} from './DetailPanel';

export const Plot = ({link}: { link: PlotLink }) => {
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
                    <Typography gutterBottom paddingLeft="20px" variant="subtitle1" component="div">
                        {link.colorMode}
                    </Typography>
                    <CardMedia
                        component="img"
                        height="200"
                        image={link.url}
                        alt={link.colorMode}
                    />
                </CardActionArea>
            </Card>

            <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
                <DialogContent>
                    <DialogContentText>
                        <img src={link.url} alt="Full Image" style={{maxWidth: '100%'}}/>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Plot;