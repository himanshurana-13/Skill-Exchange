import Exchange from '../models/Exchange.js';
import User from '../models/User.js';

// Get all exchanges for the authenticated user
export const getExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .sort({ createdAt: -1 });

    res.json(exchanges);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exchanges', error: error.message });
  }
};

// Create a new exchange proposal
export const createExchange = async (req, res) => {
  try {
    const { recipientId, senderSkill, recipientSkill } = req.body;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Create new exchange
    const exchange = new Exchange({
      sender: req.user._id,
      recipient: recipientId,
      senderSkill,
      recipientSkill
    });

    await exchange.save();
    res.status(201).json(exchange);
  } catch (error) {
    res.status(500).json({ message: 'Error creating exchange', error: error.message });
  }
};

// Update exchange status
export const updateExchangeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const exchange = await Exchange.findById(id);
    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    // Check if user is the recipient
    if (exchange.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this exchange' });
    }

    exchange.status = status;
    await exchange.save();

    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: 'Error updating exchange', error: error.message });
  }
}; 