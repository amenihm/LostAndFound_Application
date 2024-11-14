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
        contactInfo: JSON.parse(req.body.contactInfo), // Parse the JSON string
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
      console.log('Update request received:', req.params.id);
      console.log('Request body:', req.body);

      let contactInfo;
      try {
        contactInfo = JSON.parse(req.body.contactInfo);
        console.log('Parsed contact info:', contactInfo);
      } catch (error) {
        console.error('Error parsing contactInfo:', error);
        return res.status(400).json({ message: 'Invalid contact info format' });
      }

      const updateData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        location: req.body.location,
        status: req.body.status,
        date: req.body.date,
        contactInfo: {
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone || ''
        }
      };

      // Add image only if a new one is uploaded
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      console.log('Final update data:', updateData);

      const updatedItem = await Item.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedItem) {
        return res.status(404).json({ message: 'Item not found' });
      }

      console.log('Updated item:', updatedItem);
      res.json(updatedItem);
    } catch (error) {
      console.error('Update error:', error);
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
