const { Schema, model } = require("mongoose");

const MemberSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    required: true,
    unique: true,
  },
  expulsion_points: {
    type: Number,
    default: 10,
  },
});

module.exports = model("Member", MemberSchema);
