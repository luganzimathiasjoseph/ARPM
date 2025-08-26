const AssetConfirmation = require('../models/AssetConfirmation');
const Asset = require('../models/Asset');

exports.createConfirmation = async (req, res) => {
  try {
    req.body.confirmedBy = req.user.id;
    
    const asset = await Asset.findById(req.body.asset);
    if (!asset) {
      return res.status(400).json({ message: 'Invalid asset ID' });
    }
    
    if (req.user.role === 'staff' && asset.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only confirm assets assigned to you' });
    }
    
    const confirmation = await AssetConfirmation.create(req.body);
    await confirmation.populate(['asset', 'confirmedBy']);
    
    res.status(201).json(confirmation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getConfirmations = async (req, res) => {
  try {
    const filter = {};
    
    if (req.user.role === 'staff') {
      const userAssets = await Asset.find({ assignedTo: req.user.id }).select('_id');
      const assetIds = userAssets.map(asset => asset._id);
      filter.asset = { $in: assetIds };
    }
    
    const confirmations = await AssetConfirmation.find(filter)
      .populate('asset', 'assetId name serialNumber')
      .populate('confirmedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(confirmations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getConfirmation = async (req, res) => {
  try {
    const confirmation = await AssetConfirmation.findById(req.params.id)
      .populate('asset', 'assetId name serialNumber')
      .populate('confirmedBy', 'name email');
      
    if (!confirmation) return res.status(404).json({ message: 'Confirmation not found' });
    res.json(confirmation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
