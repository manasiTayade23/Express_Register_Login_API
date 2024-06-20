const express = require("express");
const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "ASSIGNMENT";
const User = db.users;

const signup = async (req, res) => {
  const { first_name, last_name, dob, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email: email } });
    //checking if user already exists in database
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
        data: [],
      });
    }
    //store hashed password in the database
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await User.create({
      first_name: first_name,
      last_name: last_name,
      dob: dob,
      email: email,
      password: hashedPassword,
    });
    const token = jwt.sign({ email: result.email, id: result.id }, SECRET_KEY);
    res.status(200).json({
      success: true,
      message: "User created successfully",
      data: result,
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: [],
    });
  }
};

const signin = async (req, res) => {
  //already exist using email
  const { email, password } = req.body;
  try {
    //email is unique for every user hence we will be using it for finding the user in db
    const existingUser = await User.findOne({
      where: { email: email, password: password }, 
    });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: [],
      });
    }
    //stored hash password in db so need to use bcrypt to compare password
    const matchedPassword = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!matchedPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
        data: [],
      });
    }
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser.id },
      SECRET_KEY
    );
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: existingUser,
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: error,
    });
  }
};

module.exports = { signin, signup };