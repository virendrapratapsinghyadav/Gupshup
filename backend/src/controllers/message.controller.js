import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Message } from '../models/Message.model.js';
import { User } from '../models/User.model.js';
import cloudinary from '../utils/cloudinary.js';



//Get All contacts
const getAllContacts = async (req, res) => {
    console.log("Logged in user:", req.user);

    try {
        const loggedInUserId = req.user.id;

        const filteredUsers = await User.find({
            _id: { $ne: loggedInUserId } // exclude logged in user
        }).select("-password");

        return res.status(200).json(
            new apiResponse(200, filteredUsers, "All contacts fetched")
        );
    } catch (error) {
        return res.status(404).json(
            new apiError(404, "Contacts not found")
        );
    }
}

//Get Messages by User ID
const getMessagesByUserId = async(req, res) => {
    try {
        const myId = req.user.id;    //6907610ae8c00ffe519616c0 -johnSnow
        console.log(myId);
        
        const {id: userToChatId } = req.params;  //690760afca902a93454cf56b - virendra
        console.log(userToChatId);

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId }
            ],
        });
        if(!messages || messages.length === 0 ){
            return res.status(404)
            .json(
                new apiResponse(404, "0 Messages lol!!")
            )
        }
        return res.status(200)
        .json(
          new apiResponse(200, messages, "All messages fetched")
        )
    } catch (error) {
        console.log("Bhai koi message nahi hai..", error.message);
        return res.status(500)
        .json(new apiError(500, "Internal server error"))
    }
}

//Send Messages 
const sendMessage = async(req, res)=>{
    try {
        const senderId = req.user.id;
        const {id: receiverId} = req.params;
        const {image, text} = req.body;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })
        await newMessage.save();

        return res.status(200)
        .json(
            new apiResponse(200, newMessage, "Message sent Successfully")
        )
        //SEND message in real time if user exist in database


    } catch (error) {
        throw new apiError(500, "Internal Server Error");
    }
}

//Get chat Partners
const getChatPartners = async(req, res) => {
    try {
        const loggedInUserId = req.user.id;

        //Find all the messages where logged-in use is either as sender or receiver
        const messages =  await Message.find({
            $or:[
                {senderId: loggedInUserId},
                {receiverId: loggedInUserId}
            ]
        });

        const getChatPartnerIds = [
            //ADDing set so that fetch only UniqueUser for every text not sameUser again again for different texts
            ...new Set(
                messages.map(
            msg => msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString() : msg.senderId.toString()
        )
        ),
        ];

        const chatPartners = await User.find({
           _id:{ $in: getChatPartnerIds }
        }).select("-password");

        return res.status(200)
        .json(
            new apiResponse(200, chatPartners, "ChatPartners Fetched successfully")
        )
    } catch (error) {
        throw new apiError(500, "Internal server error")
    }
}




export { getAllContacts, getMessagesByUserId, sendMessage, getChatPartners };