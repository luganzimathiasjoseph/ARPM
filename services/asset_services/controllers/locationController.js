const Location = require('../models/Location');

exports.createLocation = async (req, res) => {
  try {
    const loc = await Location.create(req.body);
    res.status(201).json(loc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.listLocations = async (_req, res) => {
  try {
    console.log('Listing all locations');
    const locs = await Location.find();
    console.log('Found locations:', locs.length);
    res.json(locs);
  } catch (err) {
    console.error('Error in listLocations:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    console.log('Getting location by ID:', req.params.id);
    const loc = await Location.findById(req.params.id);
    console.log('Found location:', loc);
    if (!loc) return res.status(404).json({ message: 'Location not found' });
    res.json(loc);
  } catch (err) {
    console.error('Error in getLocationById:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const loc = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!loc) return res.status(404).json({ message: 'Not found' });
    res.json(loc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const loc = await Location.findByIdAndDelete(req.params.id);
    if (!loc) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


