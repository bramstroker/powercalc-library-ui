import { Divider, Stack, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Fragment, type ReactNode } from "react";
import { Link as RouterLink } from "react-router";

import { AliasChips } from "../../AliasChips";

import { PROFILE_ATTRIBUTE_GROUPS, type ProfileAttribute } from "./types";

export const FilterLink = ({
  filterKey,
  value,
  label,
  children,
}: {
  filterKey: string;
  value: string;
  label: string;
  children: ReactNode;
}) => (
  <Tooltip
    title={`Show all profiles with this ${label.toLowerCase()}`}
    describeChild
    arrow
    placement="top"
  >
    <Link
      component={RouterLink}
      to={`/?${filterKey}=${encodeURIComponent(value)}`}
      prefetch="intent"
      underline="always"
      color="primary"
      sx={{ cursor: "pointer", textDecorationStyle: "dotted" }}
    >
      {children}
    </Link>
  </Tooltip>
);

const ProfileAttributeValue = ({ attribute }: { attribute: ProfileAttribute }) => {
  if (attribute.render && attribute.value != null) {
    return attribute.render(attribute.value);
  }

  if (attribute.label === "Aliases" && attribute.value) {
    return <AliasChips aliases={attribute.value as string[]} />;
  }

  const display = attribute.display ?? ((value: string) => value);

  if (Array.isArray(attribute.value)) {
    const values = attribute.value.map(String);
    if (attribute.stackValues) {
      return (
        <Stack component="span" spacing={0.25} sx={{ alignItems: "flex-start" }}>
          {values.map((value) => (
            <Box component="span" key={`${attribute.filterKey ?? "v"}-${value}`}>
              {attribute.filterKey ? (
                <FilterLink filterKey={attribute.filterKey} value={value} label={attribute.label}>
                  {display(value)}
                </FilterLink>
              ) : (
                display(value)
              )}
            </Box>
          ))}
        </Stack>
      );
    }

    return (
      <>
        {values.map((value, index) => (
          <Fragment key={`${attribute.filterKey ?? "v"}-${value}`}>
            {attribute.filterKey ? (
              <FilterLink filterKey={attribute.filterKey} value={value} label={attribute.label}>
                {display(value)}
              </FilterLink>
            ) : (
              display(value)
            )}
            {index < values.length - 1 && ", "}
          </Fragment>
        ))}
      </>
    );
  }

  if (attribute.filterKey && attribute.value != null) {
    return (
      <FilterLink
        filterKey={attribute.filterKey}
        value={String(attribute.value)}
        label={attribute.label}
      >
        {display(String(attribute.value))}
      </FilterLink>
    );
  }

  if (attribute.value == null || typeof attribute.value === "object") {
    return null;
  }

  return display(String(attribute.value));
};

export const ProfileAttributeGrid = ({ attributes }: { attributes: ProfileAttribute[] }) => (
  <Stack spacing={3}>
    {PROFILE_ATTRIBUTE_GROUPS.map(({ key, label }) => {
      const items = attributes.filter((attribute) => attribute.group === key);
      if (items.length === 0) return null;

      const headingId = `attribute-group-${key}`;
      return (
        <Box
          component="section"
          key={key}
          data-testid="attribute-group"
          aria-labelledby={headingId}
        >
          <Typography
            component="h2"
            id={headingId}
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: ".08em", m: 0 }}
          >
            {label}
          </Typography>
          <Divider sx={{ mb: 0.5 }} />

          <Grid component="dl" container spacing={1} sx={{ m: 0 }}>
            {items.map((attribute) => (
              <Grid
                component="div"
                size={{ xs: 12, sm: 6, md: 3 }}
                key={`${attribute.label}-${attribute.filterKey ?? ""}`}
                data-testid="profile-attribute"
                sx={{
                  py: 1,
                  minWidth: 0,
                  display: "grid",
                  gridTemplateColumns: "34px minmax(0, 1fr)",
                  alignContent: "start",
                }}
              >
                <Typography
                  component="dt"
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    gridColumn: "1 / -1",
                    display: "grid",
                    gridTemplateColumns: "34px minmax(0, 1fr)",
                    alignItems: "start",
                  }}
                >
                  <attribute.icon aria-hidden="true" fontSize="small" />
                  <Box component="span">{attribute.label}</Box>
                </Typography>
                <Box
                  component="dd"
                  sx={{
                    gridColumn: 2,
                    m: 0,
                    color: "text.primary",
                    overflowWrap: "anywhere",
                  }}
                >
                  <ProfileAttributeValue attribute={attribute} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    })}
  </Stack>
);
