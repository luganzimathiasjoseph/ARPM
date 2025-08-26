const mongoose = require('mongoose');
const Asset = require('../models/Asset');

const RequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['new', 'replacement'], required: true },
  category: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  decidedAt: { type: Date },
});

const AssetRequest = mongoose.models.AssetRequest || mongoose.model('AssetRequest', RequestSchema);

exports.createRequest = async (req, res) => {
  try {
    const reqDoc = await AssetRequest.create({ ...req.body, requester: req.user.id });
    res.status(201).json(reqDoc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.listMyRequests = async (req, res) => {
  try {
    const items = await AssetRequest.find({ requester: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listAllRequests = async (_req, res) => {
  try {
    const items = await AssetRequest.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const updated = await AssetRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', decidedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Request not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const updated = await AssetRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', decidedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Request not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCondition = async (req, res) => {
  try {
    const { assetId, condition } = req.body;
    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    // Only allow if assigned to user
    if (String(asset.assignedTo) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    asset.condition = condition;
    await asset.save();
    res.json(asset);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


