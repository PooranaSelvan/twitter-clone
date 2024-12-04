import React from 'react';
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "../components/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";

const NotificationPage = () => {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/notifications", {
          method: "DELETE",
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Notifications cleared");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen bg-black text-white">
      <div className="sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur-sm border-b border-gray-700">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-bold ml-16 lg:ml-0">Notifications</h1>
          <button
            onClick={deleteNotifications}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
            title="Clear all notifications"
          >
            <FaTrash className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : notifications?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <IoSettingsOutline className="w-16 h-16 mb-4" />
          <p className="text-xl font-semibold">No notifications yet</p>
          <p className="mt-2">When you get notifications, they'll show up here.</p>
        </div>
      ) : (
        <div>
          {notifications?.map((notification) => (
            <div
              key={notification._id}
              className="border-b border-gray-800 hover:bg-gray-900 transition-colors duration-200"
            >
              <Link to={`/profile/${notification.from.username}`} className="flex items-start space-x-3 p-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full object-cover border-2 border-blue-500"
                    src={notification.from.profileImg || "/avatar-placeholder.png"}
                    alt={`${notification.from.username}'s profile`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-400">
                    @{notification.from.username}
                  </p>
                  <p className="text-sm text-gray-300 mt-1">
                    {notification.type === "follow" ? "started following you" : "liked your post"}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {notification.type === "follow" ? (
                    <FaUser className="w-5 h-5 text-blue-500" />
                  ) : (
                    <FaHeart className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;

