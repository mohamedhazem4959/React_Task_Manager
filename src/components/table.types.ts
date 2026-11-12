type SortKey = 'client' | 'country' | 'date';
type SortDirection = 'asc' | 'desc';

export type DashboardState = {
  sort: {
    key: SortKey;
    direction: SortDirection;
  } | null;

  filters: {
    client: string;
    country: string;
    email: string;
    project: string;
    status: string;
  };

  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };
};

export type DashboardAction =
  // sorting
  | { type: 'SORT'; payload: SortKey }

  //filtring
  | { type: 'FILTER'; payload: { key: string; value: string } }
  | { type: 'RESET_FILTERS' }

  // pagination
  | { type: 'CHANGE_PAGE'; payload: number }
  | { type: 'CHANGE_PAGE_SIZE'; payload: number };
