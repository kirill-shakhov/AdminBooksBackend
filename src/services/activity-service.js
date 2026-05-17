const ApiError = require("../exceptions/api-error");
const Activity = require("../models/Activity");
const User = require("../models/User");
const ActivityDto = require("../dtos/activity-dto");

class ActivityService {

  async createActivity(userId, type) {
    try {
      const user = await User.findById(userId)

      if (!user) {
        throw ApiError.NotFound("User not found")
      }

      const activity = new Activity({
        userId: user._id,
        type: type,
      })

      await activity.save()

      const activityDto = new ActivityDto(activity);

      return activityDto;
    } catch (error) {
      throw ApiError.BadRequest("Error creating activity")
    }
  }

  async getUserActivities(userId) {
    try {
      const activities = await Activity.find({ userId }).sort({ createdAt: -1 });
      return activities.map((activity) => new ActivityDto(activity));
    } catch (error) {
      throw ApiError.BadRequest("Error retrieving user activities")
    }
  }

  async removeUserActivities(userId) {
    try {
      await Activity.deleteMany({ userId });
    } catch (error) {
      throw ApiError.BadRequest("Error removing user activities")
    }   
  }
}

module.exports = new ActivityService();