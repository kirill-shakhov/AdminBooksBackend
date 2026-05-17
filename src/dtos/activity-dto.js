module.exports = class ActivityDto {
  constructor(activity) {
    this.type = activity.type;
    this.createdAt = activity.createdAt;
  }
}