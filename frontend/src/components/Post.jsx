import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FaRegComment, FaRegHeart, FaRegBookmark, FaTrash } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";

import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../utils/date";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();
  const postOwner = post.user;
  const isLiked = post.likes.includes(authUser._id);
  const isMyPost = authUser._id === post.user._id;
  const formattedDate = formatPostDate(post.createdAt);

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");
      return data;
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/like/${post._id}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to like post");
      return data;
    },
    onSuccess: (updatedLikes) => {
      queryClient.setQueryData(["posts"], (oldData) =>
        oldData.map((p) => (p._id === post._id ? { ...p, likes: updatedLikes } : p))
      );
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/comment/${post._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");
      return data;
    },
    onSuccess: () => {
      toast.success("Comment posted successfully");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!isCommenting && comment.trim()) commentPost();
  };

  return (
    <div className="border-b border-gray-800 p-4 bg-black text-white">
      <div className="flex space-x-3">
        <Link to={`/profile/${postOwner.username}`} className="flex-shrink-0">
          <img
            src={postOwner.profileImg || "/avatar-placeholder.png"}
            alt={postOwner.fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>
        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-center space-x-1">
            <Link to={`/profile/${postOwner.username}`} className="font-semibold hover:underline">
              {postOwner.fullName}
            </Link>
            <span className="text-gray-500 text-sm">@{postOwner.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-xs">{formattedDate}</span>
          </div>
          <p className="mt-1 text-sm">{post.text}</p>
          {post.img && (
            <img src={post.img} alt="" className="mt-2 rounded-lg max-h-80 object-cover w-full" />
          )}
          <div className="mt-3 flex items-center justify-between text-gray-500">
            <button
              onClick={() => !isLiking && likePost()}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-400"
              }`}
            >
              {isLiking ? (
                <LoadingSpinner size="sm" />
              ) : (
                <FaRegHeart className="w-4 h-4" />
              )}
              <span>{post.likes.length}</span>
            </button>
            <button
              onClick={() => document.getElementById(`comments_modal${post._id}`).showModal()}
              className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
            >
              <FaRegComment className="w-4 h-4" />
              <span>{post.comments.length}</span>
            </button>
            <button className="hover:text-blue-400 transition-colors">
              <FaRegBookmark className="w-4 h-4" />
            </button>
            {isMyPost && (
              <button
                onClick={() => !isDeleting && deletePost()}
                className="hover:text-red-500 transition-colors"
              >
                {isDeleting ? <LoadingSpinner size="sm" /> : <FaTrash className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      <dialog id={`comments_modal${post._id}`} className="modal">
        <div className="modal-box bg-gray-00 border border-gray-800 rounded-lg max-w-lg w-full p-6">
          <h3 className="font-bold text-lg mb-4">Comments</h3>
          <div className="space-y-4 max-h-60 overflow-auto">
            {post.comments.length === 0 ? (
              <p className="text-gray-500">No comments yet. Be the first to comment :)</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <img
                    src={comment.user.profileImg || "/avatar-placeholder.png"}
                    alt={comment.user.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold">{comment.user.fullName}</span>
                      <span className="text-gray-500 text-sm">@{comment.user.username}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handlePostComment} className="mt-4 flex items-center space-x-2">
            <textarea
              className="flex-grow bg-gray text-white border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="2"
            />
            <button
              type="submit"
              disabled={isCommenting || !comment.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCommenting ? <LoadingSpinner size="sm" /> : "Post"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default Post;

