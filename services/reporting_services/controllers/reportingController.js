const Asset = require('../../asset_services/models/Asset');
// const WorkOrder = require('../../maintenance_services/models/WorkOrder');

exports.assetUtilizationReport = async (req, res) => {
  try {
    // Placeholder: return count per status
    const counts = await Asset.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    res.json({ summary: counts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
exports.maintenanceCostReport = async (req, res) => {
  try {
    // Placeholder: sum of parts quantities as cost proxy
    const costs = await WorkOrder.aggregate([
      { $unwind: { path: '$partsUsed', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, totalParts: { $sum: { $ifNull: ['$partsUsed.quantity', 0] } } } }
    ]);
    res.json({ totalPartsQuantity: costs[0]?.totalParts || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downtimeReport = async (req, res) => {
  try {
    // Placeholder: count of completed vs open work orders
    const statuses = await WorkOrder.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    res.json({ workOrderStatuses: statuses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.customReport = async (req, res) => {
  try {
    // Accepts a simple aggregation pipeline in body (secured in real systems)
    const { collection, pipeline } = req.body;
    if (!Array.isArray(pipeline)) return res.status(400).json({ message: 'Invalid pipeline' });
    const model = { assets: Asset, workorders: WorkOrder }[String(collection).toLowerCase()];
    if (!model) return res.status(400).json({ message: 'Unknown collection' });
    const result = await model.aggregate(pipeline);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
*/