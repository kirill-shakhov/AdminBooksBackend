const ActivityService = require("../../services/activity-service");

class ActivitiesController {

  async getUserActivities(req, res) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const activities = await ActivityService.getUserActivities(userId);
      res.json(activities);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }
}

module.exports = new ActivitiesController();
