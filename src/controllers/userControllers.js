import User from "../models/User";
import Video from "../models/Video";

import bcrypt from "bcrypt";
import fetch from "node-fetch";

const BASE_USERS_PUG_PATH = "users/";
const BAD_REQUEST_CODE = 400;
const NOT_FOUND_CODE = 404;

export const getJoin = (req, res) => {
  return res.render(BASE_USERS_PUG_PATH + "join", {
    pageTitle: "Join",
  });
};

export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;

  if (password !== password2) {
    return res.status(BAD_REQUEST_CODE).render(BASE_USERS_PUG_PATH + "join", {
      pageTitle: "Join",
      errorMessage: "Password confirmation does not match.",
    })
  }

  const exists = await User.exists({ $or : [ { username }, { email } ] });
  if (exists) {
    return res.status(BAD_REQUEST_CODE).render(BASE_USERS_PUG_PATH + "join", {
      pageTitle: "Join",
      errorMessage: "This username/email is already taken.",
    })
  }

  try {
    await User.create({
      name,
      username,
      email,
      password,
      location
    })
    return res.redirect("/login");
  } catch (error) {
    return res.status(BAD_REQUEST_CODE).render(BASE_USERS_PUG_PATH + "join", {
      pageTitle: "Join",
      errorMessage: error._message
    })
  }
};

export const getLogin = (req, res) => {
  return res.render(BASE_USERS_PUG_PATH + "login", {
    pageTitle: "Login",
  })
};

export const postLogin = async (req, res) => {
  const {username, password} = req.body;
  const user = await User.findOne({ username, socialOnly: false });

  if (!user) {
    return res.status(NOT_FOUND_CODE).render(BASE_USERS_PUG_PATH + "login", {
      pageTitle: "Login",
      errorMessage: "An account with this username does not exists.",
    })
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(NOT_FOUND_CODE).render(BASE_USERS_PUG_PATH + "login", {
      pageTitle: "Login",
      errorMessage: "Wrong password",
    })
  }

  req.session.loggedIn = true;
  req.session.user = user;

  return res.redirect("/");
};

export const startGithubLgin = (req, res) => {
  const baseUrl = 'https://github.com/login/oauth/authorize';
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  }

  const params = new URLSearchParams(config).toString();

  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLgin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await(
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
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        socialOnly: true,
        location: userData.location,
        avatarUrl: userData.avatar_url,
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
  req.session.destroy();
  req.flash("info", "Bye~");
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render(BASE_USERS_PUG_PATH + "edit", {
    pageTitle: "Edit Profile",
  })
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user,
    },
    body: {
      name, email, username, location
    },
    file,
  } = req;

  if (user.username !== username) {
    const sameUsernameUser = await User.find({ username });
    if (sameUsernameUser.length !== 0) {
      return res.status(BAD_REQUEST_CODE).render(BASE_USERS_PUG_PATH + "edit", {
        pageTitle: "Edit Profile",
        errorMessage: "This username is already taken.",
      })
    }
  }

  if (user.email !== email) {
    const sameEmailUser = await User.find({ email });
    if (sameEmailUser.length !== 0) {
      return res.status(BAD_REQUEST_CODE).render(BASE_USERS_PUG_PATH + "edit", {
        pageTitle: "Edit Profile",
        errorMessage: "This email is already taken.",
      })
    }
  }

  const updatedUser = await User.findByIdAndUpdate(user._id,
    {
      avatarUrl: file ? file.path : user.avatarUrl,
      name,
      email,
      username,
      location,
    },
    {
      new: true
    }
  )

  req.session.user = updatedUser;

  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  return res.render(BASE_USERS_PUG_PATH + "change-password", {
    pageTitle: "Change Password",
  })
};

export const postChangePassword = async (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Can't change passwrod because you join in with Github");
    return res.redirect("/");
  }
  
  const {
    session: { user },
    body: {
      oldPassword, newPassword, newPasswordConfirmation
    },
  } = req;
  
  const ok = await bcrypt.compare(oldPassword, user.password);
  
  if (!ok) {
    return res.status(BAD_REQUEST_CODE).render(BASE_USERS_PUG_PATH + "change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    })
  }
  
  if (newPassword !== newPasswordConfirmation) {
    return res.status(BAD_REQUEST_CODE).render(BASE_USERS_PUG_PATH + "change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation",
    })
  }

  const updatedUser = await User.findById(user._id);
  updatedUser.password = newPassword;
  await updatedUser.save();
  req.session.user = updatedUser;

  req.flash("info", "Password Updated");
  return res.redirect("/");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const shownUser = await User.findById(id).populate("videos");

  if (!shownUser) {
    return res.status(NOT_FOUND_CODE).render("404", {
      pageTitle: "User not found",
    })
  }

  return res.render(BASE_USERS_PUG_PATH + "profile", {
    pageTitle: shownUser.username,
    shownUser,
  })
};
