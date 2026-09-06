import { Tooltip } from "@mui/material";
import Link from "@mui/material/Link";
import { Fragment, type ReactNode } from "react";
import { Link as RouterLink } from "react-router";

import { AliasChips } from "../AliasChips";

import attributeStyles from "./ProfileAttributeGrid.css?inline";
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
        <span className="profile-attributes-stackedValues">
          {values.map((value) => (
            <span key={`${attribute.filterKey ?? "v"}-${value}`}>
              {attribute.filterKey ? (
                <FilterLink filterKey={attribute.filterKey} value={value} label={attribute.label}>
                  {display(value)}
                </FilterLink>
              ) : (
                display(value)
              )}
            </span>
          ))}
        </span>
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
  <div className="profile-attributes-groups">
    <style>{attributeStyles}</style>
    {PROFILE_ATTRIBUTE_GROUPS.map(({ key, label }) => {
      const items = attributes.filter((attribute) => attribute.group === key);
      if (items.length === 0) return null;

      const headingId = `attribute-group-${key}`;
      return (
        <section key={key} data-testid="attribute-group" aria-labelledby={headingId}>
          <h2 id={headingId} className="profile-attributes-heading">
            {label}
          </h2>
          <hr className="profile-attributes-divider" />
          <dl className="profile-attributes-grid">
            {items.map((attribute) => (
              <div
                className="profile-attributes-attribute"
                key={`${attribute.label}-${attribute.filterKey ?? ""}`}
                data-testid="profile-attribute"
              >
                <dt className="profile-attributes-label">
                  <attribute.icon aria-hidden="true" fontSize="small" />
                  <span>{attribute.label}</span>
                </dt>
                <dd className="profile-attributes-value">
                  <ProfileAttributeValue attribute={attribute} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      );
    })}
  </div>
);
