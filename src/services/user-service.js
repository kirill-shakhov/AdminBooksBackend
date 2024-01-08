const User = require("../models/User");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const Role = require("../models/Role");
const UserDto = require("../dtos/user-dto");
const tokenService = require("./token-service");
const ApiError = require('../exceptions/api-error');

class UserService {
    async registration(req) {
        const {username, password, firstName, lastName, email} = req.body;
        const candidate = await User.findOne({username});
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь ${username} с таким именем уже существует`)
        }

        const hashPassword = await bcrypt.hashSync(password, 7);
        const activationLink = uuid.v4();
        const userRole = await Role.findOne({value: "USER"});
        const user = new User({
            username,
            password: hashPassword,
            email,
            firstName,
            lastName,
            image: req.file ? req.file.path : null, // Получаем путь к загруженному файлу
            activationLink,
            roles: [userRole.value]
        });

        await user.save(); // Сохранение пользователя
        // await mailService.sendActivationMail(email, activationLink);


        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async login({username, password}) {
        const user = await User.findOne({username});

        if (!user) {
            // return res.status(400).json({message: `Пользователь ${username} не найден`})
            throw ApiError.BadRequest(`Пользователь ${username} не найден`)

        }

        const validPassword = await bcrypt.compareSync(password, user.password)

        if (!validPassword) {
            throw ApiError.BadRequest(`Введен неверный пароль`)
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }


    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {

        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }


        const user = await User.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}


    }


}

module.exports = new UserService();