import { useMemo, useReducer } from 'react';
import { data } from '../utils/data';
import { BsThreeDots } from 'react-icons/bs';
import {
  AiOutlineDown,
  AiOutlineSearch,
  AiOutlineReload,
} from 'react-icons/ai';
import type { DashboardAction, DashboardState } from './table.types';

const initialState: DashboardState = {
  sort: null,
  filters: {
    client: '',
    country: '',
    email: '',
    project: '',
    status: '',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 5,
  },
};

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    case 'SORT': {
      const direction =
        state.sort?.key === action.payload && state.sort.direction === 'asc'
          ? 'desc'
          : 'asc';
      return {
        ...state,
        sort: { key: action.payload, direction },
        pagination: { ...state.pagination, currentPage: 1 },
      };
    }

    case 'CHANGE_PAGE': {
      return {
        ...state,
        pagination: { ...state.pagination, currentPage: action.payload },
      };
    }

    case 'FILTER': {
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
        pagination: { ...state.pagination, currentPage: 1 },
      };
    }

    case 'RESET_FILTERS': {
      return {
        ...state,
        filters: { ...initialState.filters },
        pagination: { ...state.pagination, currentPage: 1 },
      };
    }

    default:
      return state;
  }
}

const sortOptions = [
  { key: 'client', label: 'Name' },
  { key: 'country', label: 'Country' },
  { key: 'date', label: 'Date' },
] as const;

const textFilters = [
  { key: 'client', label: 'Name', placeholder: 'Search name…' },
  { key: 'country', label: 'Country', placeholder: 'Search country…' },
  { key: 'email', label: 'Email', placeholder: 'Search email…' },
  { key: 'project', label: 'Project', placeholder: 'Search project…' },
] as const;

const statusOptions = ['Completed', 'Pending', 'In Progress'] as const;

const statusClasses: Record<string, string> = {
  Completed: 'bg-green-500',
  Pending: 'bg-yellow-500',
  'In Progress': 'bg-blue-500',
};

const Table = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { currentPage, itemsPerPage } = state.pagination;

  const sortedProjects = useMemo(() => {
    if (!state.sort) return data;

    const { key, direction } = state.sort;
    const factor = direction === 'asc' ? 1 : -1;

    return [...data].sort((a, b) => {
      switch (key) {
        case 'client':
          return a.client.localeCompare(b.client) * factor;
        case 'country':
          return a.country.localeCompare(b.country) * factor;
        case 'date':
          return (
            (new Date(a.date).getTime() - new Date(b.date).getTime()) * factor
          );
        default:
          return 0;
      }
    });
  }, [state.sort]);

  const filteredProjects = useMemo(
    () =>
      sortedProjects.filter((project) =>
        Object.entries(state.filters).every(([key, value]) => {
          if (value === '' || value == null) return true;
          return String(project[key as keyof typeof project])
            .toLowerCase()
            .includes(String(value).toLowerCase());
        }),
      ),
    [sortedProjects, state.filters],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / itemsPerPage),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const currentProjects = filteredProjects.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const hasActiveFilters = Object.values(state.filters).some((v) => v !== '');

  return (
    <div className="p-4 w-[93%] ml-20">
      {/* Toolbar: sort + filters */}
      <div className="mb-5 flex flex-col gap-4 rounded-lg border border-gray-700/70 bg-gray-800/20 p-4">
        {/* Sort row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Sort by
          </span>
          {sortOptions.map(({ key, label }) => {
            const active = state.sort?.key === key;
            const asc = active && state.sort?.direction === 'asc';
            return (
              <button
                key={key}
                onClick={() => dispatch({ type: 'SORT', payload: key })}
                className={`group inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? 'border-gray-400 bg-gray-700/60 text-white'
                    : 'border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {label}
                <AiOutlineDown
                  className={`h-3 w-3 transition-transform ${
                    asc ? 'rotate-180' : ''
                  } ${
                    active
                      ? 'text-white'
                      : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="h-px bg-gray-700/50" />

        {/* Filter row */}
        <div className="flex flex-wrap items-end gap-3">
          {textFilters.map(({ key, label, placeholder }) => (
            <div key={key} className="flex min-w-[170px] flex-col gap-1">
              <label className="text-xs text-gray-400">{label}</label>
              <div className="relative">
                <AiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={state.filters[key]}
                  onChange={(e) =>
                    dispatch({
                      type: 'FILTER',
                      payload: { key, value: e.target.value },
                    })
                  }
                  placeholder={placeholder}
                  className="w-full rounded-md border border-gray-700 bg-transparent py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 transition-colors hover:border-gray-600 focus:border-gray-400 focus:outline-none"
                />
              </div>
            </div>
          ))}

          <div className="flex min-w-[170px] flex-col gap-1">
            <label className="text-xs text-gray-400">Status</label>
            <div className="relative">
              <select
                value={state.filters.status}
                onChange={(e) =>
                  dispatch({
                    type: 'FILTER',
                    payload: { key: 'status', value: e.target.value },
                  })
                }
                className="w-full cursor-pointer appearance-none rounded-md border border-gray-700 bg-transparent py-2 pl-3 pr-9 text-sm text-white transition-colors hover:border-gray-600 focus:border-gray-400 focus:outline-none"
              >
                <option value="" className="bg-gray-800">
                  All statuses
                </option>
                {statusOptions.map((s) => (
                  <option key={s} value={s} className="bg-gray-800">
                    {s}
                  </option>
                ))}
              </select>
              <AiOutlineDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: 'RESET_FILTERS' })}
            disabled={!hasActiveFilters}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors ${
              hasActiveFilters
                ? 'border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800 hover:text-white'
                : 'cursor-not-allowed border-gray-700/40 text-gray-600'
            }`}
          >
            <AiOutlineReload className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <table className="min-w-full table-auto rounded border border-gray-700 text-white">
        <thead>
          <tr>
            <th className="px-5 py-3 text-left">Image</th>
            <th className="px-5 py-3 text-left">Name</th>
            <th className="px-5 py-3 text-left">Country</th>
            <th className="px-5 py-3 text-left">Email</th>
            <th className="px-5 py-3 text-left">Project Name</th>
            <th className="px-5 py-3 text-left">Task Progress</th>
            <th className="px-5 py-3 text-left">Status</th>
            <th className="px-5 py-3 text-left">Date</th>
            <th className="px-5 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentProjects.length === 0 && (
            <tr>
              <td
                colSpan={9}
                className="px-5 py-8 text-center text-sm text-gray-500"
              >
                No projects match the current filters.
              </td>
            </tr>
          )}
          {currentProjects.map((project) => (
            <tr
              key={`${project.email}-${project.project}-${project.date}`}
              className="border border-gray-700"
            >
              <td className="px-4 py-2">
                <img
                  src={project.image}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                />
              </td>
              <td className="px-4 py-2">{project.client}</td>
              <td className="px-4 py-2">{project.country}</td>
              <td className="px-4 py-2">{project.email}</td>
              <td className="px-4 py-2">{project.project}</td>
              <td className="px-4 py-2">
                <div className="h-2 w-24 overflow-hidden rounded bg-gray-700">
                  <div
                    className="h-2 rounded bg-green-500"
                    style={{ width: project.progress }}
                  />
                </div>
              </td>
              <td className="w-40 px-4 py-2">
                <span
                  className={`${
                    statusClasses[project.status] ?? 'bg-gray-500'
                  } rounded p-1`}
                >
                  {project.status}
                </span>
              </td>
              <td className="px-4 py-2">{project.date}</td>
              <td className="px-4 py-2">
                <button
                  type="button"
                  className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-800"
                  aria-label="Row actions"
                >
                  <BsThreeDots />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Page {safePage} of {totalPages} · {filteredProjects.length} result
          {filteredProjects.length === 1 ? '' : 's'}
        </span>
        <div className="flex gap-2">
          <button
            className="rounded border border-gray-700 px-3 py-1.5 text-sm text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            disabled={safePage === 1}
            onClick={() =>
              dispatch({ type: 'CHANGE_PAGE', payload: safePage - 1 })
            }
          >
            Previous
          </button>
          <button
            className="rounded border border-gray-700 px-3 py-1.5 text-sm text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            disabled={safePage >= totalPages}
            onClick={() =>
              dispatch({ type: 'CHANGE_PAGE', payload: safePage + 1 })
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Table;
