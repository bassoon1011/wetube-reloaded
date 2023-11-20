import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
    const { name, username, email, password, password2, location } = req.body;
    console.log(req.body);
    const pageTitle = "Join";
    if(password !== password2) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "Password confirmation does not match.",
        });
    }
    const exists = await User.exists({ $or: [{ username }, { email }] });
    if(exists) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "This username/email is already taken",
        });
    }
    try {
        const user = await User.create({
            name, 
            username, 
            email, 
            password,
            location,
        });
        console.log(user);
    return res.redirect("/login");
    } catch (error) {
        return res.status(400).render("join", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }
};

export const getLogin = (req, res) => res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
    const { username, password } = req.body;

    const pageTitle = "Login";
    const user = await User.findOne({ username, socialOnly: false });
    if (!user) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "An account with this username does not exists.",
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "Wrong password",
        });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};

// export const startGithubLogin = (req, res) => {
//     const baseUrl = "https://github.com/login/oauth/authorize";
//     const config = {
//         client_id: "process.env.GH_CLIENT",
//         allow_signup: false,
//         /** scope로 필요한걸 지정해 놓으면 access_token으로 이 정보를 가져옴 */
//         scope: "read:user user:email",
//     };
//     const params = new URLSearchParams(config).toString();
//     const finalUrl = `${baseUrl}?${params}`;
//     return res.redirect(finalUrl); 
// };

// export const finishGithubLogin = async (req, res) => {
//     const baseUrl = "https://github.com/login/oauth/access_token"
//     const config = {
//         client_id: process.env.GH_CLIENT,
//         client_secret: process.env.GH_SECRET,
//         code: req.query.code,
//     };
//     const params = new URLSearchParams(config).toString();
//     const finalUrl = `${baseUrl}?${params}`;
//     const tokenRequest = await (
//         await fetch(finalUrl, {
//             method: "POST",
//             headers: {
//                 Accept: "application/json",
//             },
//         })
//     ).json();
//     /** 이 token으로 Github API랑 상호작용 가능 */
//     if ("access_token" in tokenRequest) {
//         const { access_token } = tokenRequest;
//         const apiUrl = "https://api.github.com/user";
//         const userData = await (
//             await fetch( `${apiUrl}/user`, {
//                 headers: {
//                     Authorization: `token ${access_token}`,
//                 },
//             })
//         ).json();
//         console.log(userData);
//         const emailData = await (
//             await fetch( `${apiUrl}/user/emails`, {
//                 headers: {
//                     Authorization: `token ${access_token}`,
//                 },
//             })
//         ).json();
//         const emailObj = emailData.find(
//             (email) => email.primary === true && email.verified === true 
//         );
//         if (!emailObj) {
//             // set notification
//             return res.redirect("/login");
//         }
//         let user = await User.findOne({ email: emailObj.email });
//         if (!user) {
//             user = await User.create({
//                 avatarUrl: userData.avatar_url,
//                 name: userData.name,
//                 username: userData.login,
//                 email: emailObj.email,
//                 password:"",
//                 socialOnly: true,
//                 location: userData.location,
//             });
//         }
//         /** 프론트엔드는 이 세션으로부터 정보를 얻는다. 유저가 로그인할때만 session이 입력되기때문에 profile edit을 할때에도 
//          * session을 업데이트 해줘야함 */
//         req.session.loggedIn = true;
//         req.session.user = user;
//         return res.redirect("/");
//         } else {
//             return res.redirect("/login");
//         }
// };

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};

export const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
    /** Session에서 로그인된 사용자를 확인하는 것 */
    const {
        session: {
            user: { _id, avatarUrl },
        },
        body: { name, email, username, location },
        file,
    } =req;

    const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
            /** 유저가 파일을 form으로 보낸다면 file.path 를 쓰고, 파일이 존재하지 않는다면 기존 avatarUrl을 유지할거다.
             * form에 file이 있다면 req에 있는 file object를 사용할수 있다는거고 그 말은 file.path가 존재 한다는 것.
             * file이 없다면 user의 avatarUrl은 기존의 것과 같다. avatarUrl은 바로 위 req.session.user.avatarUrl에서 온 것.
            */
            avatarUrl: file ? file.path : avatarUrl,
            name,
            email,
            username,
            location,
        },
        { new: true }
    );

    /** res.session.user안에 있는 내용을 전해주는 것 */
    req.session.user = updatedUser
    return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
    if (req.session.user.socialOnly === true) {
        return res.redirect("/");
    }
    /** change-password를 base template로부터 extend 할건데 base template에는 pageTitle이 꼭 필요하다 */
    return res.render("users/change-password", { pageTitle: "Change Password" });
};


export const postChangePassword = async (req, res) => {

    const {
        session: {
            user: { _id },
        },
        body: { oldPassword, newPassword, newPasswordConfirmation },
    } = req;

    const user = await User.findById(_id);
    const ok = await bcrypt.compare(oldPassword, user.password);

    if (!ok) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "The current password is incorrent",
        });
    }

    if (newPassword !== newPasswordConfirmation) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "The password does not match the confirmation",
        });
    }

    user.password = newPassword;

    await user.save();

    return res.redirect("/users/logout");
};

export const see = async (req,res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate("videos");
    
    if (!user) {
        return res.status(404).render("404", { pageTitle: "User not found." });
    }
    
    return res.render("users/profile", {
        pageTitle: user.name,
        user,
    }); 
};