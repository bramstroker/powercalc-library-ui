import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { Typography } from '@mui/material';

export const Header = ({
    total = 0,
  }: {
    total?: number;
  }) => {
    return (
        <header>
            <Grid container>
                <Grid xs={8}>
                    <Typography variant="h4" component="h1">
                        Powercalc profile library
                    </Typography>
                </Grid>
                <Grid xs={4} display="flex" justifyContent="flex-end">
                    <Typography>{total} Total profiles</Typography>
                </Grid>
            </Grid>
        </header>
    );
}

export default Header;