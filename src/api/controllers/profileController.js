const fs = require("fs");
const path = require("path");

const User = require("../../models/User");
const ApiError = require("../../exceptions/api-error");
const UserDto = require("../../dtos/user-dto");
const { validationResult } = require("express-validator");
const s3Service = require("../../services/s3Service");

const ActivityService = require("../../services/activity-service");
const { ACTIVITY_TYPES } = require("../../constants/activity.constants");

class Profile {
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await User.findById(userId);
      if (!profile) {
        throw ApiError.NotFound("User not found");
      }
      const userDto = new UserDto(profile);
      return res.status(200).json(userDto);
    } catch (e) {
      next(e);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw ApiError.BadRequest(
          "Ошибка при обновлении профиля",
          errors.array(),
        );
      }

      const userId = req.user.id;
      const currentUser = await User.findById(userId);

      if (req.file) {
        if (currentUser.image) {
          const parsedUrl = new URL(currentUser.image);
          const fileKey = parsedUrl.pathname.slice(1);
          await s3Service.deleteFileFromS3(process.env.AWS_S3_BUCKET, fileKey);
        }

        const response = await s3Service.uploadFileToS3(req.file, "avatars");
        console.log(response);
        currentUser.image = response.href;
      }

      [
        "username",
        "email",
        "firstName",
        "lastName",
        "country",
        "bio",
      ].forEach((field) => {
        if (field in req.body) {
          currentUser[field] = req.body[field];
        }
      });

      if (req.body.userSettings) {
        currentUser.userSettings = {
          ...currentUser.userSettings,
          ...req.body.userSettings,
        };
      }

      await currentUser.save();
      await ActivityService.createActivity(currentUser._id, ACTIVITY_TYPES.PROFILE_UPDATED);

      const userDto = new UserDto(currentUser);

      return res
        .status(200)
        .json({ message: "Профиль успешно обновлен", user: userDto });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new Profile();
