  import React, { useEffect, useRef, useState } from "react";
  import { Link, useParams } from "react-router-dom";
  import { useQuery } from "@tanstack/react-query";
  import { FaArrowLeft, FaLink } from "react-icons/fa";
  import { IoCalendarOutline } from "react-icons/io5";
  import { MdEdit } from "react-icons/md";
  import { HiOutlineTrash } from "react-icons/hi";

  import Posts from "../../components/Posts";
  import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
  import EditProfileModal from "./EditProfileModal";
  import { formatMemberSinceDate } from "../../utils/date";
  import useFollow from "../../redux/useFollow";
  import useUpdateUserProfile from "../../redux/useUpdateUserProfile";

  const ProfilePage = () => {
    const [coverImg, setCoverImg] = useState(null);
    const [profileImg, setProfileImg] = useState(null);
    const [feedType, setFeedType] = useState("posts");

    const coverImgRef = useRef(null);
    const profileImgRef = useRef(null);

    const { username } = useParams();
    const { follow, isPending } = useFollow();
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

    const {
      data: user,
      isLoading,
      refetch,
      isRefetching,
    } = useQuery({
      queryKey: ["userProfile", username],
      queryFn: async () => {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch user profile");
        return data;
      },
    });

    const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

    const isMyProfile = authUser?._id === user?._id;
    const memberSinceDate = formatMemberSinceDate(user?.createdAt);
    const amIFollowing = authUser?.following?.includes(user?._id);

    const handleImgChange = (e, type) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          type === "coverImg" ? setCoverImg(reader.result) : setProfileImg(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const deleteProfile = async () => {
      if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        return;
      }
      try {
        const res = await fetch(`/api/users/delete/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Failed to delete account");
        }
        alert("Account successfully deleted");
        navigate("/"); // Redirect to the home page or login page
      } catch (error) {
        alert(error.message);
      }
    };

    useEffect(() => {
      refetch();
    }, [username, refetch]);

    if (isLoading || isRefetching) return <ProfileHeaderSkeleton />;
    if (!user) return <p className="text-center text-lg mt-4 text-white">User not found</p>;

    return (
      <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen bg-black text-white">
        <header className="sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur-sm border-b border-gray-800 p-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white hover:bg-gray-800 p-2 rounded-full transition-colors">
              <FaArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-xl">{user.fullName}</h1>
            </div>
          </div>
        </header>

        <div className="relative">
          <div className="h-48 bg-gray-800 relative group">
            <img src={coverImg || user.coverImg || "/cover.png"} alt="Cover" className="w-full h-full object-cover"/>
            {isMyProfile && (
              <button className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => coverImgRef.current.click()}>
                <MdEdit className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="absolute -bottom-16 left-4">
            <div className="relative group">
              <img src={profileImg || user.profileImg || "/avatar-placeholder.png"} alt={user.fullName} className="w-32 h-32 rounded-full border-4 border-black"/>
              {isMyProfile && (
                <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => profileImgRef.current.click()}>
                  <MdEdit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end p-4">
            {isMyProfile ? (
              <div className="flex flex-wrap gap-2">
                <EditProfileModal authUser={authUser} />
                <button className="px-4 py-2 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors flex items-center gap-1" onClick={deleteProfile}>
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                className="px-4 py-2 bg-white text-black font-bold rounded-full hover:bg-opacity-90 transition-colors"
                onClick={() => follow(user._id)}
                disabled={isPending}
              >
                {isPending ? "Loading..." : amIFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-20 px-4 space-y-4">
          <div>
            <h2 className="font-bold text-xl">{user.fullName}</h2>
            <span className="text-gray-500">@{user.username}</span>
          </div>

          {user.bio && <p className="text-sm">{user.bio}</p>}

          <div className="flex flex-wrap flex-col gap-4 text-sm text-gray-400">
            {user.link && (
              <a href={user.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-400">
                <FaLink className="w-4 h-4" />
                {user.link}
              </a>
            )}
            <div className="flex items-center gap-1">
              <IoCalendarOutline className="w-4 h-4" />
              <span>{memberSinceDate}</span>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <span className="text-gray-400 hover:underline">
              <strong className="text-white">{user.following?.length || 0}</strong> <Link to="/following">Following</Link>
            </span>
            <span className="text-gray-400 hover:underline">
              <strong className="text-white">{user.followers?.length || 0}</strong> <Link to="/followers">Followers</Link>
            </span>
          </div>
        </div>

        <nav className="flex border-b border-gray-800 mt-4">
          <button
            className={`flex-1 py-4 text-center transition-colors ${
              feedType === "posts" ? "border-b-2 border-blue-500 font-bold" : "text-gray-500 hover:bg-gray-900"
            }`}
            onClick={() => setFeedType("posts")}
          >
            Posts
          </button>
          <button
            className={`flex-1 py-4 text-center transition-colors ${
              feedType === "likes" ? "border-b-2 border-blue-500 font-bold" : "text-gray-500 hover:bg-gray-900"
            }`}
            onClick={() => setFeedType("likes")}
          >
            Likes
          </button>
        </nav>

        <Posts feedType={feedType} username={username} userId={user._id} />

        <input
          type="file"
          hidden
          ref={coverImgRef}
          onChange={(e) => handleImgChange(e, "coverImg")}
          accept="image/*"
        />
        <input
          type="file"
          hidden
          ref={profileImgRef}
          onChange={(e) => handleImgChange(e, "profileImg")}
          accept="image/*"
        />

        {(coverImg || profileImg) && (
          <div className="fixed bottom-4 right-4 bg-gray-900 p-4 rounded-lg shadow-lg">
            <p className="mb-2">You have unsaved changes</p>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              onClick={async () => {
                await updateProfile({ coverImg, profileImg });
                setCoverImg(null);
                setProfileImg(null);
              }}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? "Updating..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    );
  };

  export default ProfilePage;