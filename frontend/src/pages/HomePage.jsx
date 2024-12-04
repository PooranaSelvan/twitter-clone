import React, { useState } from "react";
import Posts from "../components/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");

  return (
    <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur-sm">
        <nav className="flex w-full border-b border-gray-700">
          <FeedTab
            active={feedType === "forYou"}
            onClick={() => setFeedType("forYou")}
          >
            For you
          </FeedTab>
          <FeedTab
            active={feedType === "following"}
            onClick={() => setFeedType("following")}
          >
            Following
          </FeedTab>
        </nav>
      </header>

      {/* Create Post Input */}
      <CreatePost />

      {/* Posts */}
      <Posts feedType={feedType} />
    </div>
  );
};

const FeedTab = ({ children, active, onClick }) => (
  <button
    className={`flex-1 py-4 px-6 text-center transition duration-200 ease-in-out ${
      active
        ? "font-bold text-white border-b-2 border-blue-500"
        : "text-gray-500 hover:text-white hover:bg-gray-900"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default HomePage;

