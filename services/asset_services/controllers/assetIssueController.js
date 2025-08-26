const AssetIssue = require('../models/AssetIssue');
const Asset = require('../models/Asset');

// Create new asset issue
exports.createIssue = async (req, res) => {
  try {
    // Set reportedBy to current user
    req.body.reportedBy = req.user.id;
    req.body.department = req.user.department || 'General';
    
    // Validate asset exists if provided
    if (req.body.asset) {
      const asset = await Asset.findById(req.body.asset);
      if (!asset) {
        return res.status(400).json({ message: 'Invalid asset ID' });
      }
    }
    
    const issue = await AssetIssue.create(req.body);
    
    // Populate references for response
    await issue.populate(['asset', 'reportedBy', 'assignedTo']);
    
    res.status(201).json(issue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all issues (filtered by user role)
exports.getIssues = async (req, res) => {
  try {
    const filter = {};
    
    // Staff can only see their own issues
    if (req.user.role === 'staff') {
      filter.reportedBy = req.user.id;
    }
    
    // Filter by status
    if (req.query.status) filter.status = req.query.status;
    
    // Filter by issue type
    if (req.query.issueType) filter.issueType = req.query.issueType;
    
    // Filter by priority
    if (req.query.priority) filter.priority = req.query.priority;
    
    // Filter by assigned technician
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    
    // Search by title or description
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const issues = await AssetIssue.find(filter)
      .populate('asset', 'assetId name serialNumber')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all issues for admin (no user filtering)
exports.getAllIssues = async (req, res) => {
  try {
    const filter = {};
    
    // Filter by status
    if (req.query.status) filter.status = req.query.status;
    
    // Filter by issue type
    if (req.query.issueType) filter.issueType = req.query.issueType;
    
    // Filter by priority
    if (req.query.priority) filter.priority = req.query.priority;
    
    // Filter by assigned technician
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    
    // Search by title or description
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const issues = await AssetIssue.find(filter)
      .populate('asset', 'assetId name serialNumber')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single issue
exports.getIssue = async (req, res) => {
  try {
    const issue = await AssetIssue.findById(req.params.id)
      .populate('asset', 'assetId name serialNumber category location')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name');
      
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    // Staff can only view their own issues
    if (req.user.role === 'staff' && issue.reportedBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(issue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update issue
exports.updateIssue = async (req, res) => {
  try {
    const issue = await AssetIssue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    // Staff can only update their own issues
    if (req.user.role === 'staff' && issue.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update timestamp
    req.body.updatedAt = Date.now();
    
    const updatedIssue = await AssetIssue.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate(['asset', 'reportedBy', 'assignedTo', 'resolvedBy']);
    
    res.json(updatedIssue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete issue
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await AssetIssue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    // Staff can only delete their own issues
    if (req.user.role === 'staff' && issue.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await AssetIssue.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Assign issue to technician (admin only)
exports.assignIssue = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    
    const issue = await AssetIssue.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo,
        status: 'in_progress',
        updatedAt: Date.now()
      },
      { new: true }
    ).populate(['asset', 'reportedBy', 'assignedTo']);
    
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Resolve issue (technician or admin)
exports.resolveIssue = async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    
    const issue = await AssetIssue.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'resolved',
        resolvedBy: req.user.id,
        resolvedAt: Date.now(),
        resolutionNotes,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate(['asset', 'reportedBy', 'assignedTo', 'resolvedBy']);
    
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get issue statistics
exports.getIssueStats = async (req, res) => {
  try {
    const filter = {};
    
    // Staff can only see their own stats
    if (req.user.role === 'staff') {
      filter.reportedBy = req.user.id;
    }
    
    const stats = await AssetIssue.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalIssues: { $sum: 1 },
          byStatus: {
            $push: {
              status: '$status',
              count: 1
            }
          },
          byType: {
            $push: {
              issueType: '$issueType',
              count: 1
            }
          },
          byPriority: {
            $push: {
              priority: '$priority',
              count: 1
            }
          }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return res.json({
        totalIssues: 0,
        byStatus: {},
        byType: {},
        byPriority: {}
      });
    }
    
    // Process counts
    const statusCounts = {};
    const typeCounts = {};
    const priorityCounts = {};
    
    stats[0].byStatus.forEach(item => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + item.count;
    });
    
    stats[0].byType.forEach(item => {
      typeCounts[item.issueType] = (typeCounts[item.issueType] || 0) + item.count;
    });
    
    stats[0].byPriority.forEach(item => {
      priorityCounts[item.priority] = (priorityCounts[item.priority] || 0) + item.count;
    });
    
    res.json({
      totalIssues: stats[0].totalIssues,
      byStatus: statusCounts,
      byType: typeCounts,
      byPriority: priorityCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


