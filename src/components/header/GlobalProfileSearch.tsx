import { useState } from "react";
import { useNavigate } from "react-router";

import { LibrarySearchField } from "../library/search/LibrarySearchField";

export const GlobalProfileSearch = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  return (
    <LibrarySearchField
      value={search}
      onChange={setSearch}
      onSubmit={(query) => {
        void navigate(query ? `/?${new URLSearchParams({ q: query })}` : "/");
      }}
    />
  );
};
