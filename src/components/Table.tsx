import { useReducer, useState } from 'react';
import { data } from '../utils/data';
import { BsThreeDots } from 'react-icons/bs';
import { BiSort } from 'react-icons/bi';
import { AiOutlineDown } from 'react-icons/ai';
import type { DashboardAction, DashboardState } from './table.types';

const initialState: DashboardState = {
  sort: null,

  filters: {
    name: '',
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
      // sorting
      const direction =
        state.sort?.key === action.payload && state.sort.direction === 'asc'
          ? 'desc'
          : 'asc';
      return {
        ...state,
        sort: {
          key: action.payload,
          direction,
        },
        pagination: {
          ...state.pagination,
          currentPage: 1,
        },
      };
    }

    default:
      return state;
  }
}

const Table = () => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const sortedProjects = [...data].sort((a, b) => {
    if (!state.sort) return 0;

    let comparison = 0;

    switch (state.sort.key) {
      case 'name':
        comparison = a.client.localeCompare(b.client);
        break;
      case 'country':
        comparison = a.country.localeCompare(b.country);
        break;

      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      default:
        return 0;
    }
    return state.sort.direction === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="p-4 w-[93%] ml-20">
      {/* sorting */}
      <div className="flex items-center mb-5">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => dispatch({ type: 'SORT', payload: 'name' })}
            className="border border-gray-700 p-2 rounded text-white"
          >
            Sort by Name
          </button>

          <button
            onClick={() => dispatch({ type: 'SORT', payload: 'country' })}
            className="border border-gray-700 p-2 rounded text-white"
          >
            Sort by Country
          </button>

          <button
            onClick={() => dispatch({ type: 'SORT', payload: 'date' })}
            className="border border-gray-700 p-2 rounded text-white"
          >
            Sort by Date
          </button>
        </div>

        {/* <button className="border border-gray-700 flex items-center justify-center text-white p-2 rounded">
          <BiSort className="mr-[0.3rem]" /> Sort
          <AiOutlineDown className="ml-2" />
        </button> */}
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
          {sortedProjects.map((project, index) => (
            <tr key={index} className="border border-gray-700">
              <td className="px-4 py-2">
                <img
                  src={project.image}
                  alt={project.client}
                  className="w-12 h-12 object-cover rounded-full"
                />
              </td>
              <td className="px-4 py-2">{project.client}</td>
              <td className="px-4 py-2">{project.country}</td>
              <td className="px-4 py-2">{project.email}</td>
              <td className="px-4 py-2">{project.project}</td>
              <td className="px-4 py-2">
                <div className="w-24 h-2 bg-gray-700 rounded">
                  <div
                    className={`w-[${project.progress}] h-2 bg-green-500 rounded`}
                  ></div>
                </div>
              </td>
              <td className="px-4 py-2 w-40">
                <span
                  className={`bg-${
                    project.status === 'Completed' ? 'green' : 'yellow'
                  }-500 p-1 rounded`}
                >
                  {project.status}
                </span>
              </td>
              <td className="px-4 py-2">{project.date}</td>
              <td className="px-4 py-2">
                <div className="relative">
                  <BsThreeDots className="cursor" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
