import React, { useState } from "react";
import { Chip, Stack, Popover, Typography, Box } from "@mui/material";

interface AliasChipsProps {
  aliases: string;
  maxVisible?: number;
  marginTop?: number;
}

const AliasChips: React.FC<AliasChipsProps> = ({ 
  aliases,
  maxVisible = 3,
  marginTop = 0
}) => {
  if (!aliases) {
    return null;
  }

  const aliasArray = aliases.split("|");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const open = Boolean(anchorEl);

  // Show only first N chips, with a "+N more" chip if there are more
  const visibleAliases = aliasArray.slice(0, maxVisible);
  const remainingCount = aliasArray.length - visibleAliases.length;

  return (
    <>
      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ 
          overflowX: "hidden", 
          flexWrap: "nowrap",
          maxWidth: "100%",
          mt: marginTop
        }}
      >
        {visibleAliases.map((alias, index) => (
          <Chip 
            key={index} 
            label={alias} 
            size="small" 
            variant="outlined" 
            color="primary"
          />
        ))}
        {remainingCount > 0 && (
          <Chip 
            label={`+${remainingCount} more`} 
            size="small" 
            variant="outlined" 
            color="secondary"
            onClick={handleClick}
            sx={{ cursor: "pointer" }}
          />
        )}
      </Stack>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle1" gutterBottom>
            All Aliases
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {aliasArray.map((alias, index) => (
              <Chip 
                key={index} 
                label={alias} 
                size="small" 
                variant="outlined" 
                color="primary"
              />
            ))}
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export default AliasChips;