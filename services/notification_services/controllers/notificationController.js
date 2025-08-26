exports.sendTestNotification = async (req, res) => {
  try {
    // Placeholder for email/SMS integration
    res.json({ success: true, message: 'Notification sent (mock)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





