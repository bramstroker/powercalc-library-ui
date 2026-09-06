import { useUrlSearchParams } from "./useUrlSearchParams";

const PAGE_SIZES = [25, 50, 100];

/** Keep the result position in the library URL so profile links can restore it. */
export const useLibraryPagination = (rowCount: number) => {
  const { searchParams, updateSearchParams } = useUrlSearchParams();
  const requestedSize = Number(searchParams.get("pageSize"));
  const pageSize = PAGE_SIZES.includes(requestedSize) ? requestedSize : 25;
  const requestedPage = Number(searchParams.get("page"));
  const page = Math.min(
    Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage - 1 : 0,
    Math.max(0, Math.ceil(rowCount / pageSize) - 1),
  );

  const setPagination = (next: { page: number; pageSize: number }) => {
    const nextPage = next.pageSize === pageSize ? next.page : 0;
    updateSearchParams({
      page: nextPage === 0 ? null : String(nextPage + 1),
      pageSize: next.pageSize === 25 ? null : String(next.pageSize),
    });
  };

  return { page, pageSize, setPagination };
};
