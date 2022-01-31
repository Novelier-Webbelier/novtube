import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  socialOnly: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  location: {
    type: String,
  },
  avatarUrl: {
    type: String,
    default: "/uploads/avatars/base-user.png",
    required: false,
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" }],
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
  }],
});

userSchema.pre("save", async function() {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
