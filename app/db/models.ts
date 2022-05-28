import Mongoose from "mongoose"

const { Schema } = Mongoose

const users = new Schema(
  {
    fullname: {
      type: String,
      required: [true, "Firstname is required"],
    },
    isCorporation: {
      type: Boolean,
      default: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    birthday: Date,
    description: {
      type: String,
      default: "",
    },
    tags: [String],
    avatar: {
      image: {
        type: String,
        default: "/assets/images/default-avatar.png",
      },
      color: {
        type: String,
        default: "#D8B4FE",
      },
    },
    password: {
      type: String,
      required: true,
      minLength: [8, "Password must be at least 8 characters long"],
    },
    // https://stackoverflow.com/questions/18022365/mongoose-validate-email-syntax
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: function (v: string) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v)
        },
        message: "Please enter a valid email",
      },
      required: [true, "Email required"],
    },
    socials: {
      facebook: String,
      linkedin: String,
      github: String,
      website: String,
    },
    // recruters: [{ type: Schema.Types.ObjectId, ref: "User" }],
    network: [{ type: Schema.Types.ObjectId, ref: "User" }],
    connections: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
)

const messaging = new Schema(
  {
    speakerOne: { type: Schema.Types.ObjectId, ref: "User" },
    speakerTwo: { type: Schema.Types.ObjectId, ref: "User" },
    messages: [
      {
        from: { type: Schema.Types.ObjectId, ref: "User" },
        message: String,
        date: Date,
      },
    ],
  },
  { timestamps: true }
)

export const models = [
  {
    name: "Users",
    schema: users,
    collection: "users",
  },
  {
    name: "Seed",
    schema: users,
    collection: "seedUsers",
  },
  {
    name: "Messaging",
    schema: messaging,
    collection: "messaging",
  },
]
