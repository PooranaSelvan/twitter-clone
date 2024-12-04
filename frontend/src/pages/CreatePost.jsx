import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

const CreatePost = () => {
	const [text, setText] = useState("");
	const [img, setImg] = useState(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const imgRef = useRef(null);
	const textareaRef = useRef(null);
	const emojiPickerRef = useRef(null);

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();

	const {
		mutate: createPost,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: async ({ text, img }) => {
			try {
				const res = await fetch("/api/posts/create", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ text, img }),
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},

		onSuccess: () => {
			setText("");
			setImg(null);
			toast.success("Post created successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		createPost({ text, img });
	};

	const handleImgChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleEmojiClick = (emojiObject) => {
		const emoji = emojiObject.emoji;
		const newText = text.substring(0, textareaRef.current.selectionStart) + emoji + text.substring(textareaRef.current.selectionEnd);
		setText(newText);
		setShowEmojiPicker(false);
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
				setShowEmojiPicker(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="flex flex-col sm:flex-row p-4 items-start gap-4 border-b border-gray-700">
			<div className="avatar flex self-start">
				<div className="w-8 h-8 rounded-full overflow-hidden">
					<img src={authUser.profileImg || "/avatar-placeholder.png"} alt="User avatar" className="w-full h-full object-cover" />
				</div>
			</div>
			<form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
				<textarea ref={textareaRef} className="textarea w-full p-2 text-base sm:text-lg resize-none border-none focus:outline-none border-gray-800 min-h-[100px]" placeholder="What is happening?" value={text} onChange={(e) => setText(e.target.value)}/>
				{img && (
					<div className="relative w-full sm:w-72 mx-auto">
						<IoCloseSharp
							className="absolute top-2 right-2 text-white bg-gray-800 rounded-full w-6 h-6 cursor-pointer p-1"
							onClick={() => {
								setImg(null);
								imgRef.current.value = null;
							}}
						/>
						<img src={img} className="w-full mx-auto h-auto sm:h-72 object-contain rounded" alt="Selected image" />
					</div>
				)}

				<div className="flex flex-wrap justify-between items-center border-t py-2 border-t-gray-700">
					<div className="flex gap-3 items-center mt-2 sm:mt-0">
						<div className="relative">
							<BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" onClick={() => setShowEmojiPicker(!showEmojiPicker)}/>
							{showEmojiPicker && (
								<div ref={emojiPickerRef} className="absolute bottom-8 left-0 z-10 sm:bottom-auto sm:top-8">
									<div className="relative">
										<button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-20" onClick={() => setShowEmojiPicker(false)}>
											<IoCloseSharp className="w-5 h-5" />
										</button>
										<EmojiPicker onEmojiClick={handleEmojiClick}width={290}height={350}/>
									</div>
								</div>
							)}
						</div>
						<CiImageOn className="fill-primary w-6 h-6 cursor-pointer" onClick={() => imgRef.current.click()}/>
					</div>
					<input type="file" accept="image/*" hidden ref={imgRef} onChange={handleImgChange} />
					<button className="btn btn-primary rounded-full btn-sm text-white px-4 mt-2 sm:mt-0">
						{isPending ? "Posting..." : "Post"}
					</button>
				</div>
				{isError && <div className="text-red-500 text-sm mt-2">{error.message}</div>}
			</form>
		</div>
	);
};

export default CreatePost;
