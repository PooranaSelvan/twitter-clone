import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaArrowLeft, FaUserPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import PostSkeleton from "../components/skeletons/PostSkeleton";

const FollowingPage = () => {
  const { username } = useParams();

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['userFollowing', username],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Failed to fetch user data');
      const data = await res.json();
     //  console.log(data);
      return data
    },
  });

  const { data: followingUsers, isLoading: isFollowingLoading, error: followingError } = useQuery({
    queryKey: ['followingDetails', userData?.following],
    queryFn: async () => {
      if (!userData?.following?.length) return [];
      const requests = userData.following.map(id =>
        fetch(`/api/users/${id}`).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch data for user ID: ${id}`);
          return res.json();
        })
      );
      return Promise.all(requests);
    },
    enabled: !!userData?.following,
  });

  if (isLoading || isFollowingLoading) {
    return (
      <PostSkeleton />
    );
  }

  if (error || followingError) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-red-500">
        <p>Error: {error?.message || followingError?.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white w-full">

      {/* For Medium Devices */}
      <header className="sticky hidden md:block top-0 bg-black bg-opacity-80 backdrop-blur-md z-10 border-b border-gray-800">
        <div className="flex items-center p-4 max-w-3xl mx-auto">
          <Link to={`/profile/${userData.username}`} className="mr-4 hover:bg-gray-800 p-2 rounded-full transition-colors">
            <FaArrowLeft className="text-white" />
          </Link>
          <div>
            <h1 className="font-bold text-xl">Following</h1>
          </div>
        </div>
      </header>

      {/* For Mobile Devices */}
      <header className="sticky block md:hidden top-0 bg-black bg-opacity-80 backdrop-blur-md z-10 border-b border-gray-800">
        <div className="flex items-center justify-between p-4 max-w-3xl mx-auto">
          {/* Followers text on the left */}
          <div className="flex-grow">
            <h1 className="font-bold text-xl text-left ml-12">Following</h1>
          </div>

          {/* Arrow on the right */}
          <Link to={`/profile/${userData.username}`} className="ml-4 hover:bg-gray-800 p-2 rounded-full transition-colors">
            <FaArrowLeft className="text-white" />
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        {followingUsers && followingUsers.length > 0 ? (
          <ul>
            {followingUsers.map((user, index) => (
              <motion.li key={user._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
                <Link to={`/profile/${user.username}`} className="flex flex-wrap w-full gap-6 items-center p-5">
                  <div className="flex flex-wrap justify-between items-center w-full gap-1">

                    <div className="flex flex-wrap items-center">
                      <img src={user.profileImg || '/avatar-placeholder.png'} alt={user.fullName || 'User profile'} className="w-12 h-12 rounded-full mr-4 object-cover"/>
                      <div className="flex-grow">
                        <h2 className="font-bold">{user.fullName}</h2>
                        <p className="text-gray-500 text-sm mb-1">@{user.username}</p>
                        <p className="text-gray-300">{user.bio}</p>
                        {/* {console.log(user)} */}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center">
                      <button className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-opacity-90 transition-colors">
                        Following
                      </button>
                    </div>
                    
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center w-full p-10">
            <FaUserPlus className="text-4xl text-gray-600 mb-4" />
            <p className="text-xl text-gray-500">
              You are not following anyone yet
            </p>
            <p className="text-gray-600 mt-2">When you do, they'll be listed here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default FollowingPage;

