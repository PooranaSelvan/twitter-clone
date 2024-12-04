import Notification from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
	try {

		// getting userId
		const userId = req.user._id;

		// finding nofitications with userId
		const notifications = await Notification.find({ to: userId }).populate({
			path: "from",
			select: "username profileImg", // Selecting only the username and profileImg fields.
		});

		// Updating all notifications for the user to mark them as read.
		await Notification.updateMany({ to: userId }, { read: true });

		res.status(200).json(notifications);
	} catch (error) {
		console.log("Error in getNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const deleteNotifications = async (req, res) => {
	try {

		// getting userId
		const userId = req.user._id;

		// Deleting all notifications where the recipient's ID matches the userId.
		await Notification.deleteMany({ to: userId });

		res.status(200).json({ message: "Notifications deleted successfully" });
	} catch (error) {
		console.log("Error in deleteNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
