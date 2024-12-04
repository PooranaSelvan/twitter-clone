import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";

const SearchUser = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await axios.post(`/api/users/search`, {
          query: searchQuery,
        });

        setUsers(response.data);
        setIsLoading(false);
      } catch (err) {
        setIsError(true);
        setError(err.message || "Something went wrong. Please try again.");
        setIsLoading(false);
      }
    }
  };


  return (
    <div className="p-4 w-full mx-auto">
      <div className="mb-6 relative">
        <div className="flex flex-wrap w-full">
          <input
            type="text"
            className="px-10 w-full py-2 border text-center border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Search for a user by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className="mt-3 w-full py-2 px-4 border border-transparent rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {isError && <p className="text-red-500 text-center">{error}</p>}
      {users.length > 0 && (
        <ul className="space-y-4">
          {users.map((user) => (
            <li key={user.username} className="border border-gray-400 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all hover:border-gray-200 hover:bg-gray-900 hover:shadow-gray-900">
              <Link to={`/profile/${user.username}`} className="block p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={user.profileImg || "/avatar-placeholder.png"}
                      alt={user.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.fullName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchUser;

