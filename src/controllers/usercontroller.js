import User from "../models/User";
import fetch from "node-fetch";
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
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("Login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("Login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  console.log("User Logged In Just Now!");
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  //params??? URL??? ????????? ????????? ??????????????? ???????????? ???????????? ???????????????.
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const startKakaoLogin = (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const config = {
    client_id: process.env.KA_CLIENT,
    redirect_uri: "https://youtubereloaded.herokuapp.com/users/kakao/finish",
    response_type: "code",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishKakaoLogin = async (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/token";
  const config = {
    client_id: process.env.KA_CLIENT,
    client_secret: process.env.KA_SECRET,
    grant_type: "authorization_code",
    redirect_uri: "https://youtubereloaded.herokuapp.com/users/kakao/finish",
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    //????????? ????????? ?????? ?????? API??? ??????
    const { access_token } = tokenRequest;
    const userRequest = await (
      await fetch("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-type": "application/json",
        },
      })
    ).json();
    const email = userRequest.kakao_account.email;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        avatarUrl: userRequest.properties.profile_image,
        name: userRequest.kakao_account.profile.nickname,
        username: userRequest.kakao_account.profile.nickname,
        email: email,
        password: "",
        socialOnly: true,
        location: userRequest.kakao_account.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.flash("info", "ByeBye!");
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", {
    pageTitle: `Edit ${req.session.user.name}'s profile`,
  });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    }, //session?????? ?????? user??? ??????
    body: { name, email, username, location },
    file,
    //form?????? ????????? user??? ??????
  } = req;
  console.log(file);
  const isHeroku = process.env.NODE_ENV === "production";
  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updateUser;
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Cannot Change password!");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    }, //session?????? ?????? user??? ??????
    body: { oldPassword, newPassword, newPasswordConfirmation },
    //form?????? ????????? user??? ??????
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "?????? ??????????????? ???????????? ????????????.",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "????????? ??????????????? ???????????? ????????????.",
    });
  }
  console.log("Old password", user.password);
  user.password = newPassword;
  console.log("New unhashed one", user.password);
  await user.save();
  req.flash("info", "Password is updated!!");
  return res.redirect("/users/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos");
  if (!user) {
    return res
      .status(404)
      .render("404", { pageTitle: "Can't find the User!!" });
  }
  return res.render("users/profile", {
    pageTitle: `${user.name}?????? Profile`,
    user,
  });
};
