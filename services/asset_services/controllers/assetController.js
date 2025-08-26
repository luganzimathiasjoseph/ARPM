const Asset = require('../models/Asset');
const Category = require('../models/Category');
const Location = require('../models/Location');

exports.createAsset = async (req, res) => {
  try {
    // Generate unique asset ID if not provided
    if (!req.body.assetId) {
      // Find the highest existing asset ID to ensure sequential numbering
      const lastAsset = await Asset.findOne(
        { assetId: { $regex: /^AST-\d{5}$/ } },
        { assetId: 1 }
      ).sort({ assetId: -1 });
      
      let nextNumber = 1;
      if (lastAsset && lastAsset.assetId) {
        const lastNumber = parseInt(lastAsset.assetId.replace('AST-', ''));
        nextNumber = lastNumber + 1;
      }
      
      req.body.assetId = `AST-${String(nextNumber).padStart(5, '0')}`;
    }
    
    // Set createdBy to current user
    req.body.createdBy = req.user.id;
    
    // Validate category and location exist
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }
    
    if (req.body.location) {
      const location = await Location.findById(req.body.location);
      if (!location) {
        return res.status(400).json({ message: 'Invalid location' });
      }
    }
    
    const asset = await Asset.create(req.body);
    
    // Populate references for response
    await asset.populate(['category', 'location', 'assignedTo', 'createdBy']);
    
    res.status(201).json(asset);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      res.status(400).json({ 
        message: `${field === 'assetId' ? 'Asset ID' : 'Serial Number'} already exists` 
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

exports.listAssets = async (req, res) => {
  try {
    const filter = {};
    
    // Filter by assigned user
    if (req.query.assignedTo === 'me' && req.user?.id) {
      filter.assignedTo = req.user.id;
    }
    
    // Filter by status
    if (req.query.status) filter.status = req.query.status;
    
    // Filter by condition
    if (req.query.condition) filter.condition = req.query.condition;
    
    // Filter by category
    if (req.query.category) filter.category = req.query.category;
    
    // Filter by department
    if (req.query.department) filter.department = req.query.department;
    
    // Filter by location
    if (req.query.location) filter.location = req.query.location;
    
    // Search by asset ID, name, or serial number
    if (req.query.search) {
      filter.$or = [
        { assetId: { $regex: req.query.search, $options: 'i' } },
        { name: { $regex: req.query.search, $options: 'i' } },
        { serialNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const assets = await Asset.find(filter)
      .populate('category', 'name')
      .populate('location', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('category', 'name')
      .populate('location', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');
      
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    // Update timestamp
    req.body.updatedAt = Date.now();
    
    const asset = await Asset.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate(['category', 'location', 'assignedTo', 'createdBy']);
    
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      res.status(400).json({ 
        message: `${field === 'assetId' ? 'Asset ID' : 'Serial Number'} already exists` 
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateAssetStatus = async (req, res) => {
  try {
    const { status, condition, notes } = req.body;
    
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        condition,
        $push: { 
          maintenanceHistory: {
            date: new Date(),
            type: 'Status Update',
            description: notes || `Status changed to ${status}, Condition: ${condition}`,
            technician: req.user.id
          }
        }
      },
      { new: true }
    ).populate(['category', 'location', 'assignedTo']);
    
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.moveAsset = async (req, res) => {
  try {
    const { toLocation, toDepartment, toUser, reason } = req.body;
    
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    
    // Add to movement log
    const movementEntry = {
      date: new Date(),
      fromLocation: asset.location,
      toLocation: toLocation,
      fromDepartment: asset.department,
      toDepartment: toDepartment,
      fromUser: asset.assignedTo,
      toUser: toUser,
      reason: reason,
      authorizedBy: req.user.id
    };
    
    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      {
        location: toLocation,
        department: toDepartment,
        assignedTo: toUser,
        $push: { movementLog: movementEntry }
      },
      { new: true }
    ).populate(['category', 'location', 'assignedTo']);
    
    res.json(updatedAsset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.calculateDepreciation = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    
    const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : null;
    const cost = asset.cost || 0;
    const method = asset.depreciationMethod;
    const life = asset.usefulLifeMonths || 1;
    let accumulated = 0;
    let currentValue = cost;

    if (purchaseDate) {
      const monthsInService = Math.max(0, Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      
      if (method === 'straight-line') {
        accumulated = Math.min(cost, (cost / life) * monthsInService);
        currentValue = Math.max(0, cost - accumulated);
      } else {
        // Simple declining balance approximation
        const rate = 2 / life;
        let book = cost;
        for (let i = 0; i < monthsInService; i++) {
          const monthly = (book * rate);
          book = Math.max(0, book - monthly);
        }
        accumulated = Math.max(0, cost - book);
        currentValue = book;
      }
    }

    res.json({ 
      accumulatedDepreciation: Number(accumulated.toFixed(2)),
      currentValue: Number(currentValue.toFixed(2)),
      monthsInService: purchaseDate ? Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.generateBarcodePayload = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    
    // Return data suitable for a client-side barcode/QR generator
    res.json({
      barcodeText: `${asset.assetId}`,
      qrData: {
        id: String(asset._id),
        assetId: asset.assetId,
        name: asset.name,
        serialNumber: asset.serialNumber,
        category: asset.category,
        status: asset.status,
        condition: asset.condition,
        macAddress: asset.macAddress,
        engravement: asset.engravement
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get asset statistics for dashboard
exports.getAssetStats = async (req, res) => {
  try {
    const stats = await Asset.aggregate([
      {
        $group: {
          _id: null,
          totalAssets: { $sum: 1 },
          totalValue: { $sum: '$cost' },
          byStatus: {
            $push: {
              status: '$status',
              count: 1
            }
          },
          byCondition: {
            $push: {
              condition: '$condition',
              count: 1
            }
          }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return res.json({
        totalAssets: 0,
        totalValue: 0,
        byStatus: {},
        byCondition: {}
      });
    }
    
    // Process status and condition counts
    const statusCounts = {};
    const conditionCounts = {};
    
    stats[0].byStatus.forEach(item => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + item.count;
    });
    
    stats[0].byCondition.forEach(item => {
      conditionCounts[item.condition] = (conditionCounts[item.condition] || 0) + item.count;
    });
    
    res.json({
      totalAssets: stats[0].totalAssets,
      totalValue: stats[0].totalValue,
      byStatus: statusCounts,
      byCondition: conditionCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchAssets = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const assets = await Asset.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { serialNumber: { $regex: q, $options: 'i' } }
      ]
    })
    .select('_id name serialNumber') // Only return necessary fields
    .limit(10); // Limit results for performance

    res.json({ data: assets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


