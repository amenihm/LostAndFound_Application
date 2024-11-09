const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/user.model");

// Obtenir toutes les conversations
router.get("/conversations", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ "sender._id": req.user.id }, { "receiver._id": req.user.id }],
    }).sort({ createdAt: -1 });

    // Grouper les messages par conversation
    const conversations = messages.reduce((acc, message) => {
      const otherUser =
        message.sender._id.toString() === req.user.id
          ? message.receiver
          : message.sender;

      const participantIds = [req.user.id, otherUser._id.toString()].sort();
      const conversationId = `${message.itemId}_${participantIds.join("_")}`;

      if (!acc[conversationId]) {
        acc[conversationId] = {
          id: conversationId,
          itemId: message.itemId,
          otherUser: otherUser,
          lastMessage: message,
          unreadCount:
            message.receiver._id.toString() === req.user.id && !message.read
              ? 1
              : 0,
          updatedAt: message.createdAt,
        };
      } else {
        if (message.receiver._id.toString() === req.user.id && !message.read) {
          acc[conversationId].unreadCount += 1;
        }
        if (message.createdAt > acc[conversationId].updatedAt) {
          acc[conversationId].updatedAt = message.createdAt;
        }
      }

      return acc;
    }, {});

    const sortedConversations = Object.values(conversations).sort(
      (a, b) => b.updatedAt - a.updatedAt
    );

    res.json({
      success: true,
      data: sortedConversations,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des conversations",
    });
  }
});

// Obtenir les messages d'une conversation spécifique
router.get("/conversations/:conversationId", async (req, res) => {
  try {
    const [itemId, ...userIds] = req.params.conversationId.split("_");

    const messages = await Message.find({
      itemId: itemId,
      $or: [
        { "sender._id": { $in: userIds }, "receiver._id": { $in: userIds } },
      ],
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des messages",
    });
  }
});

// Envoyer un message
router.post("/messages", async (req, res) => {
  try {
    const { receiverId, itemId, content } = req.body;

    if (!receiverId || !itemId || !content) {
      return res.status(400).json({
        success: false,
        error: "Données manquantes: receiverId, itemId et content sont requis",
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: "Destinataire non trouvé",
      });
    }

    const sender = await User.findById(req.user.id);

    const newMessage = new Message({
      sender: {
        _id: req.user.id,
        username: sender.username,
      },
      receiver: {
        _id: receiverId,
        username: receiver.username,
      },
      itemId: itemId,
      content: content,
      read: false,
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: "Message envoyé avec succès",
      data: newMessage,
    });
  } catch (error) {
    console.error("Erreur détaillée:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'envoi du message",
      details: error.message,
    });
  }
});

// Marquer les messages comme lus
router.put("/messages/read/:senderId", async (req, res) => {
  try {
    await Message.updateMany(
      {
        "sender._id": req.params.senderId,
        "receiver._id": req.user.id,
        read: false,
      },
      { read: true }
    );

    res.json({
      success: true,
      message: "Messages marqués comme lus",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur de mise à jour des messages",
    });
  }
});

module.exports = router;
