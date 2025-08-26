const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  details: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

const Audit = mongoose.models.Audit || mongoose.model('Audit', AuditSchema);

exports.log = async (actorId, action, details) => {
  try { await Audit.create({ actorId, action, details }); } catch (_) {}
};

exports.listAudits = async (_req, res) => {
  try {
    const items = await Audit.find().sort({ createdAt: -1 }).limit(500);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


