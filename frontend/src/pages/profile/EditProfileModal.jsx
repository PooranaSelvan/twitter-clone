import React, { useEffect, useState, useRef } from "react";
import useUpdateUserProfile from "../../redux/useUpdateUserProfile";

const EditProfileModal = ({ authUser }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    link: "",
    newPassword: "",
    currentPassword: "",
  });
  const [profileImg, setProfileImg] = useState(null);
  const [coverImg, setCoverImg] = useState(null);

  const { updateProfile, isUpdatingProfile } = useUpdateUserProfile();

  const profileImgRef = useRef(null);
  const coverImgRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImgChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'profileImg') setProfileImg(reader.result);
        if (type === 'coverImg') setCoverImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullName: authUser.fullName,
        username: authUser.username,
        email: authUser.email,
        bio: authUser.bio,
        link: authUser.link,
        newPassword: "",
        currentPassword: "",
      });
    }
  }, [authUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({ ...formData, profileImg, coverImg });
  };

  const closeModal = () => {
    document.getElementById("edit_profile_modal").close();
  };

  return (
    <>
      <button
        className="px-4 py-2 bg-transparent text-white border border-gray-600 rounded-full hover:bg-gray-800 transition-colors duration-200"
        onClick={() => document.getElementById("edit_profile_modal").showModal()}
      >
        Edit profile
      </button>
      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box bg-black border border-gray-700 rounded-lg shadow-lg w-full max-w-4xl p-6">
          <h3 className="font-bold text-2xl mb-6 text-white">Edit Profile</h3>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <div className="space-y-4">
                <div>
                  <span className="block text-sm font-medium text-gray-300 mb-1">Full Name</span>
                  <InputField type="text" placeholder="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange}/>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-300 mb-1">Username</span>
                  <InputField type="text" placeholder="Username" name="username" value={formData.username} onChange={handleInputChange}/>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-300 mb-1">Email</span>
                  <InputField type="email" placeholder="Email" name="email" value={formData.email} onChange={handleInputChange}/>
                </div>
              </div>
              <div className="space-y-4 mt-6 md:mt-0">
                <div>
                  <span className="block text-sm font-medium text-gray-300 mb-1">Bio</span>
                  <textarea
                    placeholder="Bio"
                    className="w-full bg-gray-900 text-white border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.bio}
                    name="bio"
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-300 mb-1">Link</span>
                  <InputField type="text" placeholder="Link" name="link" value={formData.link} onChange={handleInputChange}/>
                </div>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <div>
                <label htmlFor="profileImg" className="block text-sm font-medium text-gray-300 mb-1">Profile Image</label>
                <input type="file" id="profileImg" ref={profileImgRef} onChange={(e) => handleImgChange(e, 'profileImg')} className="hidden" accept="image/*"/>
                <button type="button" onClick={() => profileImgRef.current.click()} className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Choose Profile Image
                </button>
              </div>
              <div>
                <label htmlFor="coverImg" className="block text-sm font-medium text-gray-300 mb-1">Cover Image</label>
                <input type="file" id="coverImg" ref={coverImgRef} onChange={(e) => handleImgChange(e, 'coverImg')} className="hidden" accept="image/*"/>
                <button type="button" onClick={() => coverImgRef.current.click()} className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Choose Cover Image
                </button>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-1">Current Password</span>
                <InputField type="password" placeholder="Current Password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange}/>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-1">New Password</span>
                <InputField type="password" placeholder="New Password" name="newPassword" value={formData.newPassword} onChange={handleInputChange}/>
              </div>
            </div>
            <div className="flex justify-between items-center">
              {formData.email === "test1@gmail.com" ? (null) : (
                <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors duration-200" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </button>
              )}
              <button type="button" onClick={closeModal} className="py-2 px-4 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors duration-200">
                Close
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="cursor-default">close</button>
        </form>
      </dialog>
    </>
  );
};

const InputField = ({ type, placeholder, name, value, onChange }) => (
  <input
    type={type}
    placeholder={placeholder}
    className="w-full bg-gray-900 text-white border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    value={value}
    name={name}
    onChange={onChange}
  />
);

export default EditProfileModal;

