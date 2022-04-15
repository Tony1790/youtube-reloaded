import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already used by someone",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      password2,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(404).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Delete User");
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render("Login", {
      pageTitle,
      errorMessage: "유저네임이 틀렸습니다.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("Login", {
      pageTitle,
      errorMessage: "비밀번호가 틀렸습니다.",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  console.log("User Logged In Just Now!");
  return res.redirect("/");
};

export const logout = (req, res) => res.send("Logout");
export const see = (req, res) => res.send("SEE");
