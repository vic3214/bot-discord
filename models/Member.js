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
  monthly_capital_points: {
    type: Number,
    default: 0,
  },
  league_attacks: {
    type: Number,
    default: 0,
  },
  league_stars: {
    type: Number,
    default: 0,
  },
});

module.exports = model("Member", MemberSchema);
