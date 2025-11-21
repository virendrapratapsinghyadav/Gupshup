import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import cloudinary from "../utils/cloudinary.js";
import { getReceiverSocketId } from "../utils/socket.js";
import { io } from "../utils/socket.js";

const getAllContacts = async (req, res) => {
  //To get it i have to get all the users from the UserDB except the current User
  try {
    const loggedInUserId = req.user?._id;
    const filteredUsers = await User.find({
      _id: {
        $ne: loggedInUserId,
      },
    }).select("-password");

    return res
      .status(200)
      .json(
        new ApiResponse(200, filteredUsers, "AllContacts fetched successfully")
      );
  } catch (error) {
    console.log("GetaAllContacts error", error);
    return res
      .status(500)
      .json(new ApiError(500, "Failed to get all contacts"));
  }
};

const getAllChats = async (req, res) => {
  //To get it i have to get all the "sender/receiverIds" from the MessageDB who's if (userId === senderId || UserId === receiverId)
  try {
    const userId = req.user?._id;

    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    //Collect unique user Ids of contacts
    const contactSet = new Set();
    messages.forEach((msg) => {
      if (msg.senderId.toString() !== userId.toString())
        contactSet.add(msg.senderId.toString());
      if (msg.receiverId.toString() !== userId.toString())
        contactSet.add(msg.receiverId.toString());
    });

    //Convert set to array
    const contactIds = Array.from(contactSet);

    const filteredUsers = await User.find({
      _id: {
        $in: contactIds,
      },
    }).select("-password");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          filteredUsers,
          "All chat contacts fetched Successfully"
        )
      );
  } catch (error) {
    console.log("GET all chats error", error);
    return res.status(500).json(new ApiError(500, "Failed to getAllChats"));
  }
};

const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user?._id;
    const userToChatId = req.params?.id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    return res
      .status(200)
      .json(new ApiResponse(200, messages, "Messages fetched Successfully"));
  } catch (error) {
    console.log("Message by Id error: ", error);
    return res.status(500).json(new ApiError(500, "Failed to get Messages"));
  }
};

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user?._id;
    const receiverId = req.params?.id;

    const { text, image } = req.body;

    //to prevent empty inputs
    if (!text && !image) {
      return res
        .status(400)
        .json(new ApiError(400, "Text or image is required"));
    }

    //To prevent self messaging
    if (senderId.toString() === receiverId) {
      return res
        .status(400)
        .json(new ApiError(400, "Cannot send message to yourself"));
    }

    //Check for recevier(not optional)
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json(new ApiError(404, "Receiver not found"));
    }

    // upload base64 image to cloudinary
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    //Send message in real-time if user is online -socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res
      .status(201)
      .json(new ApiResponse(201, newMessage, "Message sent successfully"));
  } catch (error) {
    console.log("Send message error: ", error);
    return res.status(500).json(new ApiError(500, "Failed to send Message"));
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { msgId } = req.params;
    const deleteMessage = await Message.findOneAndDelete({
      _id: msgId.toString(),
    });
    if (!deleteMessage) {
      return res.status(404).json({ message: "Message doesn't exist" });
    }
    const updatedMessages = await Message.find({
      $or: [
        {
          senderId: deleteMessage.senderId,
          receiverId: deleteMessage.receiverId,
        },
        {
          senderId: deleteMessage.receiverId,
          receiverId: deleteMessage.senderId,
        },
      ],
    }).sort({ createdAt: 1 });

    res
      .status(200)
      .json(
        new ApiResponse(200, updatedMessages, "Message deleted Successfully")
      );
  } catch (error) {
    console.error("Error in deleteNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getAllContacts,
  getAllChats,
  getMessagesByUserId,
  sendMessage,
  deleteMessage,
};
