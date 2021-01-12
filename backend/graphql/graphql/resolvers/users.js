const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");
const checkAuth = require("../../util/authenticators");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../util/validators");
const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      biography: user.biography,
      profileUrl: user.profileUrl,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}

module.exports = {
  Query: {
    async getProfile(_, { userId }) {
      try {
        const user = await User.findById(userId);
        if (user) {
          return user;
        } else {
          throw new Error("User not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async changeProfileUrl(_, { userId, profileUrl }) {
      if (profileUrl.trim() === "") {
        throw new Error("Profile URL is empty");
      }
      try {
        await User.findByIdAndUpdate(userId, {
          profileUrl: profileUrl.trim(),
        });
        return "Updated profile URL successfully";
      } catch (err) {
        throw new Error(err);
      }
    },
    async changeProfile(_, { userId, firstName, lastName, biography }) {
      if (firstName.trim() === "") {
        errors.firstName = "First name must not be empty";
      }
      if (lastName.trim() === "") {
        errors.lastName = "Last name must not be empty";
      }
      if (biography.trim() === "") {
        errors.biography = "Biography must not be empty";
      }
      try {
        await User.findByIdAndUpdate(userId, {
          firstName: firstName,
          lastName: lastName,
          biography: biography,
        });
        return "Updated profile successfully";
      } catch (err) {
        throw new Error(err);
      }
    },
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user = await User.findOne({ username });

      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong credentials";
        throw new UserInputError("Wrong crendetials", { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      {
        registerInput: {
          firstName,
          lastName,
          username,
          email,
          password,
          confirmPassword,
        },
      }
    ) {
      // Validate user data
      const { valid, errors } = validateRegisterInput(
        firstName,
        lastName,
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // TODO: Make sure user doesnt already exist
      const userTaken = await User.findOne({ username });
      if (userTaken) {
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }

      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        throw new UserInputError("Email is taken", {
          errors: {
            email: "This email is taken",
          },
        });
      }
      // hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        firstName,
        lastName,
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
        profileUrl:
          "https://storage.googleapis.com/cmpt-470-profilepictures/123/default-profile-picture.jpg",
        biography: "",
        messageRooms: [],
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
