import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import XSvg from "./svgs/X";
import { MdHomeFilled, MdClose } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser, FaSearch } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { HiMenu } from "react-icons/hi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  const sidebarContent = (
    <>
      <Link to="/" className="flex justify-center" onClick={() => setIsOpen(false)}>
        <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
      </Link>
      <ul className="flex flex-col gap-3 mt-4">
        <SidebarLink to="/" icon={<MdHomeFilled className="w-8 h-8" />} text="Home" onClick={() => setIsOpen(false)} />
        <SidebarLink to="/search" icon={<FaSearch className="w-6 h-6" />} text="Explore" onClick={() => setIsOpen(false)} />
        <SidebarLink to={`/profile/${authUser?.username}`} icon={<FaUser className="w-6 h-6" />} text="Profile" onClick={() => setIsOpen(false)} />
        <SidebarLink to="/notifications" icon={<IoNotifications className="w-6 h-6" />} text="Notifications" onClick={() => setIsOpen(false)} />
      </ul>
      <Link to="/" className="mt-4 flex justify-center" onClick={() => setIsOpen(false)}>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">
          Post
        </button>
      </Link>
      {authUser && (
        <Link to={`/profile/${authUser.username}`} className="mt-auto w-full mb-10 flex gap-2 items-center transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full" onClick={() => setIsOpen(false)}>
          <div className="avatar">
            <div className="w-8 rounded-full">
              <img src={authUser?.profileImg || "/avatar-placeholder.png"} alt={authUser?.fullName} />
            </div>
          </div>
          <div className="flex justify-between w-full gap-4 items-center">
            <div className="hidden md:block">
              <p className="text-white font-bold text-sm truncate">{authUser?.fullName}</p>
              <p className="text-slate-500 text-sm">@{authUser?.username}</p>
            </div>
            <div className="flex flex-wrap">
              <BiLogOut className="w-5 h-5 cursor-pointer" onClick={(e) => { e.preventDefault(); logout();}}/>
            </div>
          </div>
        </Link>
      )}
    </>
  );

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-full"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {isOpen ? <MdClose className="w-6 h-6 text-white" /> : <HiMenu className="w-6 h-6 text-white" />}
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:block md: w-18 max-w-52">
        <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-full pt-5">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black z-40 md:hidden" onClick={toggleSidebar}/>
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed top-0 left-0 h-full w-1/4 bg-black z-50 md:hidden overflow-y-auto">
              <div className="flex flex-col h-full p-4 pt-16">
                {sidebarContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const SidebarLink = ({ to, icon, text, onClick }) => (
  <li className="flex justify-center md:justify-start">
    <Link to={to} className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-3 px-6 max-w-fit cursor-pointer" onClick={onClick}>
      {icon}
      <span className="text-lg hidden md:block">{text}</span>
    </Link>
  </li>
);

export default Sidebar;

