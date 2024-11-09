const Item = require("../models/Item");
const upload = require("../middleware/upload");

// Controller functions
const itemController = {
  // Get all items
  listItems: async (req, res) => {
    try {
      const items = await Item.find();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create new item with image
  createItem: async (req, res) => {
    try {
      const item = new Item({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        location: req.body.location,
        status: req.body.status,
        contactInfo: req.body.contactInfo,
        image: req.file ? `/uploads/${req.file.filename}` : null,
      });

      const newItem = await item.save();
      res.status(201).json(newItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get single item
  getItem: async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update item
  updateItem: async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);
      if (item) {
        item.title = req.body.title || item.title;
        item.description = req.body.description || item.description;
        item.category = req.body.category || item.category;
        item.location = req.body.location || item.location;
        item.status = req.body.status || item.status;

        if (req.body.contactInfo) {
          item.contactInfo = JSON.parse(req.body.contactInfo);
        }

        if (req.file) {
          item.image = `/uploads/${req.file.filename}`;
        }

        const updatedItem = await item.save();
        res.json(updatedItem);
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete item
  deleteItem: async (req, res) => {
    try {
      const item = await Item.findByIdAndDelete(req.params.id);
      if (item) {
        res.json({ message: "Item deleted" });
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = itemController;
