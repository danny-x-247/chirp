// ======================================================
// CHIRP
// Main JavaScript
// ======================================================


// ======================================================
// SUPABASE
// ======================================================

const SUPABASE_URL =
    "https://dciiylghdndcpmtxpgkn.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_URsgVb7R6G8ZGE_gTqStHQ_i9vkIj4G";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

console.log("Chirp connected to Supabase");



// ======================================================
// GLOBAL STATE
// ======================================================

let currentUser = null;
let currentProfile = null;

let activeChatUser = null;
let messageSubscription = null;

let searchTimer = null;



// ======================================================
// BASIC ELEMENTS
// ======================================================

const loadingScreen =
    document.getElementById("loadingScreen");

const authPage =
    document.getElementById("authPage");

const app =
    document.getElementById("app");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");

const toastIcon =
    document.getElementById("toastIcon");



// ======================================================
// TOAST
// ======================================================

let toastTimer;

function showToast(
    message,
    type = "success"
) {

    if (!toast || !toastMessage) {

        console.log(message);

        return;
    }


    clearTimeout(toastTimer);


    toastMessage.textContent = message;


    if (toastIcon) {

        if (type === "error") {

            toastIcon.className =
                "fa-solid fa-circle-exclamation";

        } else {

            toastIcon.className =
                "fa-solid fa-circle-check";
        }
    }


    toast.classList.remove("hidden");


    toastTimer = setTimeout(() => {

        toast.classList.add("hidden");

    }, 3500);
}



// ======================================================
// HELPERS
// ======================================================

function escapeHTML(value = "") {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}



function getInitial(name = "U") {

    return (
        name
            .trim()
            .charAt(0)
            .toUpperCase() || "U"
    );
}



function formatTime(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(dateString);

    const now =
        new Date();

    const difference =
        now - date;


    const seconds =
        Math.floor(difference / 1000);

    const minutes =
        Math.floor(seconds / 60);

    const hours =
        Math.floor(minutes / 60);

    const days =
        Math.floor(hours / 24);


    if (seconds < 60) {
        return "Just now";
    }


    if (minutes < 60) {
        return `${minutes}m`;
    }


    if (hours < 24) {
        return `${hours}h`;
    }


    if (days < 7) {
        return `${days}d`;
    }


    return date.toLocaleDateString();
}



// ======================================================
// AVATAR HTML
// ======================================================

function avatarContent(profile) {

    if (profile?.avatar_url) {

        return `
            <img
                src="${escapeHTML(profile.avatar_url)}"
                alt="${escapeHTML(profile.name || "Profile picture")}"
                class="avatar-image"
            >
        `;
    }


    return getInitial(profile?.name);
}



// ======================================================
// SET AVATAR ELEMENT
// ======================================================

function setAvatarElement(
    element,
    profile
) {

    if (!element) {
        return;
    }


    element.innerHTML =
        avatarContent(profile);
}



// ======================================================
// AUTH ELEMENTS
// ======================================================

const loginFormContainer =
    document.getElementById(
        "loginFormContainer"
    );

const registerFormContainer =
    document.getElementById(
        "registerFormContainer"
    );


const loginForm =
    document.getElementById(
        "loginForm"
    );

const registerForm =
    document.getElementById(
        "registerForm"
    );


const showRegisterBtn =
    document.getElementById(
        "showRegisterBtn"
    );

const showLoginBtn =
    document.getElementById(
        "showLoginBtn"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );



// ======================================================
// SWITCH AUTH FORMS
// ======================================================

showRegisterBtn?.addEventListener(
    "click",
    () => {

        loginFormContainer
            ?.classList
            .add("hidden");

        registerFormContainer
            ?.classList
            .remove("hidden");
    }
);



showLoginBtn?.addEventListener(
    "click",
    () => {

        registerFormContainer
            ?.classList
            .add("hidden");

        loginFormContainer
            ?.classList
            .remove("hidden");
    }
);



// ======================================================
// PASSWORD VISIBILITY
// ======================================================

document
    .querySelectorAll(".password-toggle")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const targetId =
                    button.dataset.target;

                const input =
                    document.getElementById(
                        targetId
                    );


                if (!input) {
                    return;
                }


                const showing =
                    input.type === "text";


                input.type =
                    showing
                        ? "password"
                        : "text";


                const icon =
                    button.querySelector("i");


                if (icon) {

                    icon.className =
                        showing
                            ? "fa-regular fa-eye"
                            : "fa-regular fa-eye-slash";
                }
            }
        );
    });



// ======================================================
// REGISTER
// ======================================================

registerForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const name =
            document
                .getElementById("registerName")
                ?.value
                .trim();


        const username =
            document
                .getElementById("registerUsername")
                ?.value
                .trim()
                .toLowerCase();


        const email =
            document
                .getElementById("registerEmail")
                ?.value
                .trim();


        const password =
            document
                .getElementById("registerPassword")
                ?.value;


        const registerBtn =
            document.getElementById(
                "registerBtn"
            );


        if (
            !name ||
            !username ||
            !email ||
            !password
        ) {

            showToast(
                "Complete all fields.",
                "error"
            );

            return;
        }


        if (
            !/^[a-z0-9_]{3,20}$/.test(
                username
            )
        ) {

            showToast(
                "Username can only contain letters, numbers and underscores.",
                "error"
            );

            return;
        }


        if (password.length < 8) {

            showToast(
                "Password must contain at least 8 characters.",
                "error"
            );

            return;
        }


        if (registerBtn) {

            registerBtn.disabled = true;

            registerBtn.textContent =
                "Creating account...";
        }


        try {

            const {
                data,
                error
            } =
                await supabaseClient.auth
                    .signUp({

                        email,

                        password,

                        options: {

                            data: {
                                name,
                                username
                            }
                        }
                    });


            if (error) {
                throw error;
            }


            registerForm.reset();


            if (data.session) {

                showToast(
                    "Welcome to Chirp!"
                );

            } else {

                showToast(
                    "Account created. Check your email if confirmation is required."
                );


                registerFormContainer
                    ?.classList
                    .add("hidden");

                loginFormContainer
                    ?.classList
                    .remove("hidden");
            }

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            showToast(
                error.message ||
                "Could not create account.",
                "error"
            );

        } finally {

            if (registerBtn) {

                registerBtn.disabled = false;

                registerBtn.textContent =
                    "Create account";
            }
        }
    }
);



// ======================================================
// LOGIN
// ======================================================

loginForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const email =
            document
                .getElementById("loginEmail")
                ?.value
                .trim();


        const password =
            document
                .getElementById("loginPassword")
                ?.value;


        const loginBtn =
            document.getElementById(
                "loginBtn"
            );


        if (!email || !password) {

            showToast(
                "Enter your email and password.",
                "error"
            );

            return;
        }


        if (loginBtn) {

            loginBtn.disabled = true;

            loginBtn.textContent =
                "Signing in...";
        }


        try {

            const {
                error
            } =
                await supabaseClient.auth
                    .signInWithPassword({
                        email,
                        password
                    });


            if (error) {
                throw error;
            }


            loginForm.reset();


            showToast(
                "Welcome back!"
            );

        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            showToast(
                error.message ||
                "Could not sign in.",
                "error"
            );

        } finally {

            if (loginBtn) {

                loginBtn.disabled = false;

                loginBtn.textContent =
                    "Sign in";
            }
        }
    }
);



// ======================================================
// LOGOUT
// ======================================================

logoutBtn?.addEventListener(
    "click",
    async () => {

        try {

            if (messageSubscription) {

                await supabaseClient
                    .removeChannel(
                        messageSubscription
                    );

                messageSubscription = null;
            }


            const {
                error
            } =
                await supabaseClient.auth
                    .signOut();


            if (error) {
                throw error;
            }


            currentUser = null;
            currentProfile = null;
            activeChatUser = null;


            showToast(
                "Signed out."
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );


            showToast(
                "Could not sign out.",
                "error"
            );
        }
    }
);



// ======================================================
// GET CURRENT PROFILE
// ======================================================

async function getCurrentProfile() {

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth
            .getUser();


    if (userError || !user) {

        return null;
    }


    currentUser = user;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();


    if (error) {

        console.error(
            "Profile loading error:",
            error
        );

        return null;
    }


    currentProfile = data;

    return data;
}



// ======================================================
// DISPLAY CURRENT PROFILE
// ======================================================

function displayCurrentProfile(profile) {

    if (!profile) {
        return;
    }


    currentProfile = profile;


    const sidebarName =
        document.getElementById(
            "sidebarName"
        );

    const sidebarUsername =
        document.getElementById(
            "sidebarUsername"
        );

    const sidebarAvatar =
        document.getElementById(
            "sidebarAvatar"
        );


    const composerAvatar =
        document.getElementById(
            "composerAvatar"
        );


    const profileName =
        document.getElementById(
            "profileName"
        );

    const profileUsername =
        document.getElementById(
            "profileUsername"
        );

    const profileBio =
        document.getElementById(
            "profileBio"
        );

    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );


    if (sidebarName) {

        sidebarName.textContent =
            profile.name || "User";
    }


    if (sidebarUsername) {

        sidebarUsername.textContent =
            `@${profile.username || "username"}`;
    }


    if (profileName) {

        profileName.textContent =
            profile.name || "User";
    }


    if (profileUsername) {

        profileUsername.textContent =
            `@${profile.username || "username"}`;
    }


    if (profileBio) {

        profileBio.textContent =
            profile.bio ||
            "Welcome to my Chirp profile.";
    }


    // IMPORTANT:
    // Show profile picture everywhere.

    setAvatarElement(
        sidebarAvatar,
        profile
    );

    setAvatarElement(
        composerAvatar,
        profile
    );

    setAvatarElement(
        profileAvatar,
        profile
    );
}



// ======================================================
// PAGE NAVIGATION
// ======================================================

async function openPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );
        });


    const targetPage =
        document.getElementById(
            pageId
        );


    targetPage
        ?.classList
        .add("active-page");


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page === pageId
            );
        });


    // Refresh page data

    if (
        pageId === "homePage" &&
        typeof loadPosts === "function"
    ) {

        await loadPosts();
    }


    if (
        pageId === "friendsPage" &&
        typeof loadFriends === "function"
    ) {

        await loadFriends();

        await loadFriendRequests();
    }


    if (
        pageId === "messagesPage" &&
        typeof loadConversations === "function"
    ) {

        await loadConversations();
    }


    if (
        pageId === "profilePage"
    ) {

        if (
            typeof loadProfileStats ===
            "function"
        ) {

            await loadProfileStats();
        }


        if (
            typeof loadMyPosts ===
            "function"
        ) {

            await loadMyPosts();
        }
    }
}



document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const pageId =
                    button.dataset.page;

                if (pageId) {

                    openPage(pageId);
                }
            }
        );
    });



// ======================================================
// NEW POST BUTTON
// ======================================================

document
    .getElementById("newPostBtn")
    ?.addEventListener(
        "click",
        () => {

            openPage("homePage");


            setTimeout(() => {

                document
                    .getElementById(
                        "postInput"
                    )
                    ?.focus();

            }, 100);
        }
    );



// ======================================================
// LOAD APPLICATION
// ======================================================

async function loadApplication() {

    const profile =
        await getCurrentProfile();


    if (!profile) {

        console.error(
            "Could not load current profile."
        );

        return;
    }


    displayCurrentProfile(profile);


    authPage
        ?.classList
        .add("hidden");

    app
        ?.classList
        .remove("hidden");


    await openPage("homePage");


    if (
        typeof loadProfileStats ===
        "function"
    ) {

        await loadProfileStats();
    }


    if (
        typeof loadFriendRequests ===
        "function"
    ) {

        await loadFriendRequests();
    }
}



// ======================================================
// INITIALIZE CHIRP
// ======================================================

async function initializeChirp() {

    try {

        const {
            data: {
                session
            }
        } =
            await supabaseClient.auth
                .getSession();


        loadingScreen
            ?.classList
            .add("hidden");


        if (session?.user) {

            currentUser =
                session.user;


            await loadApplication();

        } else {

            app
                ?.classList
                .add("hidden");

            authPage
                ?.classList
                .remove("hidden");
        }

    } catch (error) {

        console.error(
            "Initialization error:",
            error
        );


        loadingScreen
            ?.classList
            .add("hidden");

        authPage
            ?.classList
            .remove("hidden");
    }
}



// ======================================================
// AUTH STATE
// ======================================================

supabaseClient.auth
    .onAuthStateChange(
        (event, session) => {

            // Run outside the auth callback itself.
            setTimeout(
                async () => {

                    if (session?.user) {

                        currentUser =
                            session.user;

                        await loadApplication();

                    } else {

                        currentUser = null;
                        currentProfile = null;


                        app
                            ?.classList
                            .add("hidden");

                        authPage
                            ?.classList
                            .remove("hidden");
                    }

                },
                0
            );
        }
    );



// ======================================================
// START
// ======================================================

initializeChirp();

// ======================================================
// EDIT PROFILE
// ======================================================

const editProfileBtn =
    document.getElementById("editProfileBtn");

const editProfileModal =
    document.getElementById("editProfileModal");

const closeEditProfile =
    document.getElementById("closeEditProfile");

const editProfileForm =
    document.getElementById("editProfileForm");

const editName =
    document.getElementById("editName");

const editUsername =
    document.getElementById("editUsername");

const editBio =
    document.getElementById("editBio");

const editAvatarInput =
    document.getElementById("editAvatarInput");

const editAvatarPreview =
    document.getElementById("editAvatarPreview");

const editAvatarInitial =
    document.getElementById("editAvatarInitial");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");



// ======================================================
// OPEN EDIT PROFILE
// ======================================================

editProfileBtn?.addEventListener(
    "click",
    async () => {

        try {

            const profile =
                currentProfile ||
                await getCurrentProfile();


            if (!profile) {

                showToast(
                    "Could not load your profile.",
                    "error"
                );

                return;
            }


            // Fill inputs

            if (editName) {
                editName.value =
                    profile.name || "";
            }


            if (editUsername) {
                editUsername.value =
                    profile.username || "";
            }


            if (editBio) {
                editBio.value =
                    profile.bio || "";
            }


            // Clear previous file selection

            if (editAvatarInput) {
                editAvatarInput.value = "";
            }


            // Show existing profile picture

            if (profile.avatar_url) {

                if (editAvatarPreview) {

                    editAvatarPreview.src =
                        profile.avatar_url;

                    editAvatarPreview
                        .classList
                        .remove("hidden");
                }


                editAvatarInitial
                    ?.classList
                    .add("hidden");

            } else {

                if (editAvatarPreview) {

                    editAvatarPreview
                        .removeAttribute("src");

                    editAvatarPreview
                        .classList
                        .add("hidden");
                }


                if (editAvatarInitial) {

                    editAvatarInitial
                        .classList
                        .remove("hidden");

                    editAvatarInitial.textContent =
                        getInitial(profile.name);
                }
            }


            // Open modal

            editProfileModal
                ?.classList
                .remove("hidden");


        } catch (error) {

            console.error(
                "Edit profile error:",
                error
            );

            showToast(
                "Could not open Edit Profile.",
                "error"
            );
        }
    }
);



// ======================================================
// CLOSE EDIT PROFILE
// ======================================================

closeEditProfile?.addEventListener(
    "click",
    () => {

        editProfileModal
            ?.classList
            .add("hidden");
    }
);


// Click outside modal to close

editProfileModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            editProfileModal
        ) {

            editProfileModal
                .classList
                .add("hidden");
        }
    }
);



// ======================================================
// PROFILE PICTURE PREVIEW
// ======================================================

editAvatarInput?.addEventListener(
    "change",
    () => {

        const file =
            editAvatarInput.files?.[0];


        if (!file) {
            return;
        }


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            showToast(
                "Choose a JPG, PNG or WebP image.",
                "error"
            );

            editAvatarInput.value = "";

            return;
        }


        if (
            file.size >
            5 * 1024 * 1024
        ) {

            showToast(
                "Profile picture must be smaller than 5 MB.",
                "error"
            );

            editAvatarInput.value = "";

            return;
        }


        const previewURL =
            URL.createObjectURL(file);


        if (editAvatarPreview) {

            editAvatarPreview.src =
                previewURL;

            editAvatarPreview
                .classList
                .remove("hidden");
        }


        editAvatarInitial
            ?.classList
            .add("hidden");
    }
);



// ======================================================
// UPLOAD PROFILE PICTURE
// ======================================================

async function uploadProfilePicture(
    userId
) {

    const file =
        editAvatarInput
            ?.files?.[0];


    // No new picture selected
    if (!file) {
        return null;
    }


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

        throw new Error(
            "Choose a JPG, PNG or WebP image."
        );
    }


    if (
        file.size >
        5 * 1024 * 1024
    ) {

        throw new Error(
            "Profile picture must be smaller than 5 MB."
        );
    }


    let extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    if (extension === "jpeg") {
        extension = "jpg";
    }


    const filePath =
        `${userId}/avatar-${Date.now()}.${extension}`;


    const {
        error: uploadError
    } =
        await supabaseClient.storage
            .from("avatars")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );


    if (uploadError) {
        throw uploadError;
    }


    const {
        data
    } =
        supabaseClient.storage
            .from("avatars")
            .getPublicUrl(
                filePath
            );


    return data.publicUrl;
}



// ======================================================
// SAVE PROFILE
// ======================================================

editProfileForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const name =
            editName?.value
                .trim();

        const username =
            editUsername?.value
                .trim()
                .toLowerCase();

        const bio =
            editBio?.value
                .trim() || "";


        if (!name || !username) {

            showToast(
                "Name and username are required.",
                "error"
            );

            return;
        }


        if (
            !/^[a-z0-9_]{3,20}$/.test(
                username
            )
        ) {

            showToast(
                "Username must be 3–20 characters using letters, numbers or underscores.",
                "error"
            );

            return;
        }


        if (saveProfileBtn) {

            saveProfileBtn.disabled = true;

            saveProfileBtn.textContent =
                "Saving...";
        }


        try {

            const {
                data: {
                    user
                },
                error: userError
            } =
                await supabaseClient.auth
                    .getUser();


            if (userError || !user) {

                throw new Error(
                    "You are not signed in."
                );
            }


            // Keep existing picture by default

            let avatarUrl =
                currentProfile
                    ?.avatar_url ||
                null;


            // Upload only if user selected
            // a new picture.

            const newAvatarUrl =
                await uploadProfilePicture(
                    user.id
                );


            if (newAvatarUrl) {

                avatarUrl =
                    newAvatarUrl;
            }


            const {
                data: updatedProfile,
                error
            } =
                await supabaseClient
                    .from("profiles")
                    .update({

                        name,
                        username,
                        bio,

                        avatar_url:
                            avatarUrl
                    })
                    .eq("id", user.id)
                    .select()
                    .single();


            if (error) {
                throw error;
            }


            currentProfile =
                updatedProfile;


            // Immediately update
            // sidebar/profile/composer avatars

            displayCurrentProfile(
                updatedProfile
            );


            editProfileModal
                ?.classList
                .add("hidden");


            showToast(
                "Profile updated!"
            );


            // Refresh profile data

            if (
                typeof loadProfileStats ===
                "function"
            ) {

                await loadProfileStats();
            }


            if (
                typeof loadMyPosts ===
                "function"
            ) {

                await loadMyPosts();
            }


        } catch (error) {

            console.error(
                "Profile save error:",
                error
            );


            showToast(
                error.message ||
                "Could not save profile.",
                "error"
            );


        } finally {

            // IMPORTANT:
            // This makes sure the button
            // never stays disabled.

            if (saveProfileBtn) {

                saveProfileBtn.disabled =
                    false;

                saveProfileBtn.textContent =
                    "Save changes";
            }
        }
    }
);
// ======================================================
// CHIRP MESSAGING + IMAGE MESSAGES
// ======================================================


// ======================================================
// MESSAGE ELEMENTS
// ======================================================

const conversationsList =
    document.getElementById("conversationsList");

const conversationSearch =
    document.getElementById("conversationSearch");

const noChatSelected =
    document.getElementById("noChatSelected");

const activeChat =
    document.getElementById("activeChat");

const chatUserAvatar =
    document.getElementById("chatUserAvatar");

const chatUserName =
    document.getElementById("chatUserName");

const chatUserUsername =
    document.getElementById("chatUserUsername");

const messagesContainer =
    document.getElementById("messagesContainer");

const messageInput =
    document.getElementById("messageInput");

const sendMessageBtn =
    document.getElementById("sendMessageBtn");

const chatImageBtn =
    document.getElementById("chatImageBtn");

const chatImageInput =
    document.getElementById("chatImageInput");

const mobileBackToChats =
    document.getElementById("mobileBackToChats");


// ======================================================
// OPEN IMAGE PICKER
// ======================================================

chatImageBtn?.addEventListener(
    "click",
    () => {

        if (!activeChatUser) {

            showToast(
                "Choose a friend first.",
                "error"
            );

            return;
        }

        chatImageInput?.click();
    }
);


// ======================================================
// VALIDATE SELECTED IMAGE
// ======================================================

chatImageInput?.addEventListener(
    "change",
    () => {

        const file =
            chatImageInput.files?.[0];

        if (!file) {
            return;
        }


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (!allowedTypes.includes(file.type)) {

            showToast(
                "Choose a JPG, PNG or WebP image.",
                "error"
            );

            chatImageInput.value = "";

            return;
        }


        if (file.size > 5 * 1024 * 1024) {

            showToast(
                "Image must be smaller than 5 MB.",
                "error"
            );

            chatImageInput.value = "";

            return;
        }


        showToast(
            "Image selected. Press send."
        );
    }
);


// ======================================================
// UPLOAD CHAT IMAGE
// ======================================================

async function uploadChatImage(file) {

    if (!currentUser) {

        throw new Error(
            "You are not signed in."
        );
    }


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

        throw new Error(
            "Choose a JPG, PNG or WebP image."
        );
    }


    if (file.size > 5 * 1024 * 1024) {

        throw new Error(
            "Image must be smaller than 5 MB."
        );
    }


    let extension =
        file.name
            .split(".")
            .pop()
            ?.toLowerCase();


    if (
        !extension ||
        !["jpg", "jpeg", "png", "webp"]
            .includes(extension)
    ) {

        extension =
            file.type === "image/png"
                ? "png"
                : file.type === "image/webp"
                    ? "webp"
                    : "jpg";
    }


    if (extension === "jpeg") {
        extension = "jpg";
    }


    const uniqueName =
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"

            ? crypto.randomUUID()

            : `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`;


    const filePath =
        `${currentUser.id}/${uniqueName}.${extension}`;


    const {
        error: uploadError
    } =
        await supabaseClient.storage
            .from("chat-images")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",

                    upsert: false,

                    contentType: file.type
                }
            );


    if (uploadError) {
        throw uploadError;
    }


    const {
        data
    } =
        supabaseClient.storage
            .from("chat-images")
            .getPublicUrl(filePath);


    if (!data?.publicUrl) {

        throw new Error(
            "Could not get image URL."
        );
    }


    return data.publicUrl;
}


// ======================================================
// LOAD FRIEND CONVERSATIONS
// ======================================================

async function loadConversations() {

    if (!currentUser || !conversationsList) {
        return;
    }


    try {

        conversationsList.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-spinner fa-spin"></i>

                <p>Loading conversations...</p>

            </div>

        `;


        const {
            data,
            error
        } =
            await supabaseClient
                .from("friendships")
                .select(`
                    friend_id,
                    profiles!friendships_friend_id_fkey (
                        id,
                        name,
                        username,
                        avatar_url
                    )
                `)
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (error) {
            throw error;
        }


        const friends =
            (data || [])
                .map(item => item.profiles)
                .filter(Boolean);


        renderConversations(friends);


    } catch (error) {

        console.error(
            "Load conversations error:",
            error
        );


        conversationsList.innerHTML = `

            <div class="empty-state">

                <i class="fa-regular fa-message"></i>

                <h3>Could not load conversations</h3>

                <p>
                    Try refreshing the page.
                </p>

            </div>

        `;
    }
}


// ======================================================
// RENDER CONVERSATIONS
// ======================================================

function renderConversations(friends) {

    if (!conversationsList) {
        return;
    }


    conversationsList.innerHTML = "";


    if (!friends.length) {

        conversationsList.innerHTML = `

            <div class="empty-state">

                <i class="fa-regular fa-message"></i>

                <h3>No conversations yet</h3>

                <p>
                    Add friends to start chatting.
                </p>

            </div>

        `;

        return;
    }


    friends.forEach(friend => {

        const item =
            document.createElement("button");


        item.type = "button";

        item.className =
            "conversation-item";


        item.dataset.userId =
            friend.id;


        const avatar =
            document.createElement("div");


        avatar.className =
            "user-avatar";


        setAvatarElement(
            avatar,
            friend
        );


        const info =
            document.createElement("div");


        info.className =
            "conversation-info";


        const name =
            document.createElement("strong");


        name.textContent =
            friend.name || "User";


        const username =
            document.createElement("span");


        username.textContent =
            `@${friend.username || "username"}`;


        info.appendChild(name);

        info.appendChild(username);


        item.appendChild(avatar);

        item.appendChild(info);


        item.addEventListener(
            "click",
            () => {

                openConversation(friend);

            }
        );


        conversationsList.appendChild(
            item
        );
    });
}


// ======================================================
// SEARCH CONVERSATIONS
// ======================================================

conversationSearch?.addEventListener(
    "input",
    () => {

        const query =
            conversationSearch.value
                .trim()
                .toLowerCase();


        document
            .querySelectorAll(
                "#conversationsList .conversation-item"
            )
            .forEach(item => {

                const text =
                    item.textContent
                        .toLowerCase();


                item.style.display =
                    text.includes(query)
                        ? ""
                        : "none";
            });
    }
);


// ======================================================
// OPEN CONVERSATION
// ======================================================

async function openConversation(friend) {

    if (!friend?.id) {
        return;
    }


    activeChatUser = friend;


    noChatSelected
        ?.classList
        .add("hidden");


    activeChat
        ?.classList
        .remove("hidden");


    if (chatUserName) {

        chatUserName.textContent =
            friend.name || "Friend";
    }


    if (chatUserUsername) {

        chatUserUsername.textContent =
            `@${friend.username || "username"}`;
    }


    setAvatarElement(
        chatUserAvatar,
        friend
    );


    document
        .querySelectorAll(
            ".conversation-item"
        )
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.userId ===
                    friend.id
            );
        });


    await loadMessages();


    subscribeToMessages();


    messageInput?.focus();
}


// ======================================================
// LOAD MESSAGES
// ======================================================

async function loadMessages() {

    if (
        !currentUser ||
        !activeChatUser ||
        !messagesContainer
    ) {

        return;
    }


    try {

        messagesContainer.innerHTML = `

            <div class="messages-loading">

                <i class="fa-solid fa-spinner fa-spin"></i>

            </div>

        `;


        const {
            data,
            error
        } =
            await supabaseClient
                .from("messages")
                .select(`
                    id,
                    sender_id,
                    receiver_id,
                    message,
                    image_url,
                    read,
                    created_at
                `)
                .or(
                    `and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeChatUser.id}),and(sender_id.eq.${activeChatUser.id},receiver_id.eq.${currentUser.id})`
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


        if (error) {
            throw error;
        }


        messagesContainer.innerHTML = "";


        (data || []).forEach(
            message => {

                renderMessage(message);

            }
        );


        scrollMessagesToBottom();


        await markMessagesAsRead();


    } catch (error) {

        console.error(
            "Load messages error:",
            error
        );


        messagesContainer.innerHTML = `

            <div class="empty-state">

                <i class="fa-regular fa-message"></i>

                <p>
                    Could not load messages.
                </p>

            </div>

        `;
    }
}


// ======================================================
// RENDER ONE MESSAGE
// ======================================================

function renderMessage(message) {

    if (
        !message ||
        !messagesContainer ||
        !currentUser
    ) {

        return;
    }


    // Prevent duplicate realtime messages

    if (
        message.id &&
        messagesContainer.querySelector(
            `[data-message-id="${message.id}"]`
        )
    ) {

        return;
    }


    const mine =
        message.sender_id ===
        currentUser.id;


    const row =
        document.createElement("div");


    row.className =
        mine
            ? "message-row sent"
            : "message-row received";


    if (message.id) {

        row.dataset.messageId =
            message.id;
    }


    const bubble =
        document.createElement("div");


    bubble.className =
        "message-bubble";


    // IMAGE

    if (message.image_url) {

        const image =
            document.createElement("img");


        image.src =
            message.image_url;


        image.alt =
            "Chat image";


        image.className =
            "message-image";


        image.loading =
            "lazy";


        image.addEventListener(
            "load",
            scrollMessagesToBottom
        );


        bubble.appendChild(image);
    }


    // TEXT

    if (
        message.message &&
        message.message.trim()
    ) {

        const text =
            document.createElement("p");


        text.textContent =
            message.message;


        bubble.appendChild(text);
    }


    // TIME

    const time =
        document.createElement("span");


    time.className =
        "message-time";


    if (message.created_at) {

        time.textContent =
            new Date(
                message.created_at
            )
                .toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );
    }


    bubble.appendChild(time);

    row.appendChild(bubble);

    messagesContainer.appendChild(row);
}


// ======================================================
// SEND MESSAGE
// ======================================================

async function sendCurrentMessage() {

    if (
        !currentUser ||
        !activeChatUser
    ) {

        showToast(
            "Choose a friend first.",
            "error"
        );

        return;
    }


    const text =
        messageInput?.value
            .trim() || "";


    const imageFile =
        chatImageInput
            ?.files?.[0] ||
        null;


    // Nothing to send

    if (!text && !imageFile) {

        return;
    }


    if (text.length > 2000) {

        showToast(
            "Message is too long.",
            "error"
        );

        return;
    }


    if (sendMessageBtn) {

        sendMessageBtn.disabled =
            true;


        sendMessageBtn.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i>`;
    }


    if (chatImageBtn) {

        chatImageBtn.disabled =
            true;
    }


    try {

        let imageUrl = null;


        // Upload image first

        if (imageFile) {

            imageUrl =
                await uploadChatImage(
                    imageFile
                );
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("messages")
                .insert({

                    sender_id:
                        currentUser.id,

                    receiver_id:
                        activeChatUser.id,

                    message:
                        text || null,

                    image_url:
                        imageUrl

                })
                .select(`
                    id,
                    sender_id,
                    receiver_id,
                    message,
                    image_url,
                    read,
                    created_at
                `)
                .single();


        if (error) {
            throw error;
        }


        // Clear composer

        if (messageInput) {

            messageInput.value = "";

            messageInput.style.height = "";
        }


        if (chatImageInput) {

            chatImageInput.value = "";
        }


        // Display immediately.
        // Realtime duplicate protection prevents
        // it appearing twice.

        renderMessage(data);


        scrollMessagesToBottom();


    } catch (error) {

        console.error(
            "Send message error:",
            error
        );


        showToast(
            error.message ||
            "Could not send message.",
            "error"
        );


    } finally {

        if (sendMessageBtn) {

            sendMessageBtn.disabled =
                false;


            sendMessageBtn.innerHTML =
                `<i class="fa-solid fa-paper-plane"></i>`;
        }


        if (chatImageBtn) {

            chatImageBtn.disabled =
                false;
        }
    }
}


// ======================================================
// SEND BUTTON
// ======================================================

sendMessageBtn?.addEventListener(
    "click",
    sendCurrentMessage
);


// ======================================================
// PRESS ENTER TO SEND
// SHIFT + ENTER = NEW LINE
// ======================================================

messageInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendCurrentMessage();
        }
    }
);


// ======================================================
// AUTO RESIZE MESSAGE BOX
// ======================================================

messageInput?.addEventListener(
    "input",
    () => {

        messageInput.style.height =
            "auto";


        messageInput.style.height =
            `${Math.min(
                messageInput.scrollHeight,
                120
            )}px`;
    }
);


// ======================================================
// REALTIME MESSAGES
// ======================================================

function subscribeToMessages() {

    if (
        !currentUser ||
        !activeChatUser
    ) {

        return;
    }


    if (messageSubscription) {

        supabaseClient
            .removeChannel(
                messageSubscription
            );

        messageSubscription = null;
    }


    const friendId =
        activeChatUser.id;


    messageSubscription =
        supabaseClient
            .channel(
                `chat-${currentUser.id}-${friendId}`
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",

                    schema: "public",

                    table: "messages"
                },

                payload => {

                    const message =
                        payload.new;


                    const belongsToChat =

                        (
                            message.sender_id ===
                                currentUser.id &&

                            message.receiver_id ===
                                friendId
                        )

                        ||

                        (
                            message.sender_id ===
                                friendId &&

                            message.receiver_id ===
                                currentUser.id
                        );


                    if (!belongsToChat) {

                        return;
                    }


                    renderMessage(
                        message
                    );


                    scrollMessagesToBottom();


                    if (
                        message.receiver_id ===
                        currentUser.id
                    ) {

                        markMessagesAsRead();
                    }
                }
            )
            .subscribe();
}


// ======================================================
// MARK RECEIVED MESSAGES AS READ
// ======================================================

async function markMessagesAsRead() {

    if (
        !currentUser ||
        !activeChatUser
    ) {

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("messages")
            .update({
                read: true
            })
            .eq(
                "sender_id",
                activeChatUser.id
            )
            .eq(
                "receiver_id",
                currentUser.id
            )
            .eq(
                "read",
                false
            );


    if (error) {

        console.error(
            "Mark messages read error:",
            error
        );
    }
}


// ======================================================
// SCROLL CHAT TO BOTTOM
// ======================================================

function scrollMessagesToBottom() {

    if (!messagesContainer) {
        return;
    }


    requestAnimationFrame(
        () => {

            messagesContainer.scrollTop =
                messagesContainer.scrollHeight;

        }
    );
}


// ======================================================
// MOBILE BACK BUTTON
// ======================================================

mobileBackToChats?.addEventListener(
    "click",
    async () => {

        activeChatUser = null;


        activeChat
            ?.classList
            .add("hidden");


        noChatSelected
            ?.classList
            .remove("hidden");


        if (messageSubscription) {

            await supabaseClient
                .removeChannel(
                    messageSubscription
                );


            messageSubscription = null;
        }
    }
);
// ======================================================
// DISCOVER PEOPLE SEARCH
// ======================================================

const peopleSearchInput =
    document.getElementById("peopleSearchInput");

const peopleSearchResults =
    document.getElementById("peopleSearchResults");

let peopleSearchTimer = null;


// ======================================================
// SEARCH PEOPLE
// ======================================================

peopleSearchInput?.addEventListener(
    "input",
    () => {

        clearTimeout(peopleSearchTimer);

        const query =
            peopleSearchInput.value
                .trim()
                .replace(/^@/, "");


        if (!query) {

            showDefaultPeopleSearch();

            return;
        }


        peopleSearchTimer = setTimeout(
            () => {

                searchPeople(query);

            },
            350
        );
    }
);


// ======================================================
// SEARCH SUPABASE PROFILES
// ======================================================

async function searchPeople(query) {

    if (!peopleSearchResults) {
        return;
    }


    peopleSearchResults.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <p>Searching...</p>

        </div>

    `;


    try {

        const cleanQuery =
            query
                .trim()
                .replace(/^@/, "");


        const {
            data,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select(`
                    id,
                    name,
                    username,
                    bio,
                    avatar_url
                `)
                .neq(
                    "id",
                    currentUser.id
                )
                .or(
                    `name.ilike.%${cleanQuery}%,username.ilike.%${cleanQuery}%`
                )
                .limit(20);


        if (error) {
            throw error;
        }


        renderPeopleSearchResults(
            data || []
        );


    } catch (error) {

        console.error(
            "People search error:",
            error
        );


        peopleSearchResults.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>Search failed</h3>

                <p>
                    Could not search for people.
                </p>

            </div>

        `;

    }
}


// ======================================================
// RENDER SEARCH RESULTS
// ======================================================

function renderPeopleSearchResults(people) {

    if (!peopleSearchResults) {
        return;
    }


    peopleSearchResults.innerHTML = "";


    if (!people.length) {

        peopleSearchResults.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-user-slash"></i>

                <h3>No people found</h3>

                <p>
                    Try another name or username.
                </p>

            </div>

        `;

        return;
    }


    people.forEach(person => {

        const card =
            document.createElement("div");


        card.className =
            "person-card";


        // AVATAR

        const avatar =
            document.createElement("div");


        avatar.className =
            "user-avatar";


        setAvatarElement(
            avatar,
            person
        );


        // INFORMATION

        const info =
            document.createElement("div");


        info.className =
            "person-info";


        const name =
            document.createElement("strong");


        name.textContent =
            person.name || "User";


        const username =
            document.createElement("span");


        username.textContent =
            `@${person.username || "username"}`;


        info.appendChild(name);

        info.appendChild(username);


        // ADD FRIEND BUTTON

        const button =
            document.createElement("button");


        button.type =
            "button";


        button.className =
            "add-friend-btn";


        button.innerHTML = `

            <i class="fa-solid fa-user-plus"></i>

            <span>Add Friend</span>

        `;


        button.addEventListener(
            "click",
            () => {

                sendFriendRequest(
                    person.id,
                    button
                );

            }
        );


        card.appendChild(avatar);

        card.appendChild(info);

        card.appendChild(button);


        peopleSearchResults.appendChild(
            card
        );

    });
}


// ======================================================
// DEFAULT DISCOVER SCREEN
// ======================================================

function showDefaultPeopleSearch() {

    if (!peopleSearchResults) {
        return;
    }


    peopleSearchResults.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-user-group"></i>

            <h3>Search Chirp</h3>

            <p>
                Find someone using their name or username.
            </p>

        </div>

    `;

}


// ======================================================
// SEND FRIEND REQUEST
// ======================================================

async function sendFriendRequest(
    receiverId,
    button
) {

    if (!currentUser) {

        showToast(
            "You are not signed in.",
            "error"
        );

        return;
    }


    if (receiverId === currentUser.id) {

        showToast(
            "You cannot add yourself.",
            "error"
        );

        return;
    }


    if (button) {

        button.disabled = true;

        button.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>Sending...</span>

        `;
    }


    try {

        // Check if already friends

        const {
            data: existingFriend,
            error: friendError
        } =
            await supabaseClient
                .from("friendships")
                .select("friend_id")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .eq(
                    "friend_id",
                    receiverId
                )
                .maybeSingle();


        if (friendError) {
            throw friendError;
        }


        if (existingFriend) {

            showToast(
                "You are already friends."
            );


            if (button) {

                button.innerHTML = `

                    <i class="fa-solid fa-user-check"></i>

                    <span>Friends</span>

                `;
            }


            return;
        }


        // Check existing request

        const {
            data: existingRequest,
            error: requestCheckError
        } =
            await supabaseClient
                .from("friend_requests")
                .select("id, status")
                .eq(
                    "sender_id",
                    currentUser.id
                )
                .eq(
                    "receiver_id",
                    receiverId
                )
                .maybeSingle();


        if (requestCheckError) {
            throw requestCheckError;
        }


        if (existingRequest) {

            showToast(
                existingRequest.status === "pending"
                    ? "Friend request already sent."
                    : "A friend request already exists."
            );


            if (button) {

                button.innerHTML = `

                    <i class="fa-solid fa-check"></i>

                    <span>Requested</span>

                `;
            }


            return;
        }


        // Create request

        const {
            error
        } =
            await supabaseClient
                .from("friend_requests")
                .insert({

                    sender_id:
                        currentUser.id,

                    receiver_id:
                        receiverId,

                    status:
                        "pending"

                });


        if (error) {
            throw error;
        }


        showToast(
            "Friend request sent!"
        );


        if (button) {

            button.innerHTML = `

                <i class="fa-solid fa-check"></i>

                <span>Requested</span>

            `;
        }


    } catch (error) {

        console.error(
            "Send friend request error:",
            error
        );


        showToast(
            error.message ||
            "Could not send friend request.",
            "error"
        );


        if (button) {

            button.disabled = false;

            button.innerHTML = `

                <i class="fa-solid fa-user-plus"></i>

                <span>Add Friend</span>

            `;
        }

    }
}

// ======================================================
// FRIENDS + FRIEND REQUESTS SYSTEM
// ======================================================

const friendsList =
    document.getElementById("friendsList");

const friendRequests =
    document.getElementById("friendRequests");

const friendRequestCount =
    document.getElementById("friendRequestCount");

const friendsTabs =
    document.querySelectorAll("[data-friends-tab]");


// ======================================================
// FRIENDS / REQUESTS TABS
// ======================================================

friendsTabs.forEach(tab => {

    tab.addEventListener(
        "click",
        async () => {

            const target =
                tab.dataset.friendsTab;


            // Remove active state from both buttons

            friendsTabs.forEach(button => {

                button.classList.remove("active");

            });


            // Activate clicked button

            tab.classList.add("active");


            // Hide both panels

            friendsList
                ?.classList
                .add("hidden");

            friendRequests
                ?.classList
                .add("hidden");


            // Show selected panel

            if (target === "friendsList") {

                friendsList
                    ?.classList
                    .remove("hidden");

                await loadFriends();

            }


            if (target === "friendRequests") {

                friendRequests
                    ?.classList
                    .remove("hidden");

                await loadFriendRequests();

            }

        }
    );

});


// ======================================================
// LOAD FRIEND REQUESTS
// ======================================================

async function loadFriendRequests() {

    if (
        !currentUser ||
        !friendRequests
    ) {
        return;
    }


    friendRequests.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <p>Loading requests...</p>

        </div>

    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("friend_requests")
                .select(`
                    id,
                    sender_id,
                    receiver_id,
                    status,
                    created_at,
                    sender:profiles!friend_requests_sender_id_fkey (
                        id,
                        name,
                        username,
                        avatar_url
                    )
                `)
                .eq(
                    "receiver_id",
                    currentUser.id
                )
                .eq(
                    "status",
                    "pending"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {
            throw error;
        }


        renderFriendRequests(
            data || []
        );


        updateFriendRequestCount(
            data?.length || 0
        );


    } catch (error) {

        console.error(
            "Load friend requests error:",
            error
        );


        friendRequests.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>Could not load requests</h3>

                <p>
                    ${escapeHTML(
                        error.message ||
                        "Please try again."
                    )}
                </p>

            </div>

        `;

    }
}


// ======================================================
// RENDER FRIEND REQUESTS
// ======================================================

function renderFriendRequests(requests) {

    if (!friendRequests) {
        return;
    }


    friendRequests.innerHTML = "";


    if (!requests.length) {

        friendRequests.innerHTML = `

            <div class="empty-state">

                <i class="fa-regular fa-user"></i>

                <h3>No requests</h3>

                <p>
                    New friend requests will appear here.
                </p>

            </div>

        `;

        return;
    }


    requests.forEach(request => {

        const person =
            request.sender;


        if (!person) {
            return;
        }


        const card =
            document.createElement("div");


        card.className =
            "friend-card request-card";


        // ----------------------------------------------
        // AVATAR
        // ----------------------------------------------

        const avatar =
            document.createElement("div");


        avatar.className =
            "user-avatar";


        setAvatarElement(
            avatar,
            person
        );


        // ----------------------------------------------
        // INFORMATION
        // ----------------------------------------------

        const info =
            document.createElement("div");


        info.className =
            "friend-info";


        const name =
            document.createElement("strong");


        name.textContent =
            person.name || "User";


        const username =
            document.createElement("span");


        username.textContent =
            `@${person.username || "username"}`;


        info.appendChild(name);

        info.appendChild(username);


        // ----------------------------------------------
        // ACTIONS
        // ----------------------------------------------

        const actions =
            document.createElement("div");


        actions.className =
            "request-actions";


        // ACCEPT BUTTON

        const acceptBtn =
            document.createElement("button");


        acceptBtn.type =
            "button";


        acceptBtn.className =
            "accept-btn";


        acceptBtn.innerHTML = `

            <i class="fa-solid fa-check"></i>

            <span>Accept</span>

        `;


        acceptBtn.addEventListener(
            "click",
            () => {

                acceptFriendRequest(
                    request.id,
                    acceptBtn,
                    declineBtn
                );

            }
        );


        // DECLINE BUTTON

        const declineBtn =
            document.createElement("button");


        declineBtn.type =
            "button";


        declineBtn.className =
            "decline-btn";


        declineBtn.innerHTML = `

            <i class="fa-solid fa-xmark"></i>

            <span>Decline</span>

        `;


        declineBtn.addEventListener(
            "click",
            () => {

                declineFriendRequest(
                    request.id,
                    acceptBtn,
                    declineBtn
                );

            }
        );


        actions.appendChild(
            acceptBtn
        );


        actions.appendChild(
            declineBtn
        );


        card.appendChild(
            avatar
        );


        card.appendChild(
            info
        );


        card.appendChild(
            actions
        );


        friendRequests.appendChild(
            card
        );

    });

}


// ======================================================
// FRIEND REQUEST BADGE
// ======================================================

function updateFriendRequestCount(count) {

    if (!friendRequestCount) {
        return;
    }


    friendRequestCount.textContent =
        String(count);


    if (count > 0) {

        friendRequestCount
            .classList
            .remove("hidden");

    } else {

        friendRequestCount
            .classList
            .add("hidden");

    }
}


// ======================================================
// ACCEPT FRIEND REQUEST
// ======================================================

async function acceptFriendRequest(
    requestId,
    acceptBtn,
    declineBtn
) {

    if (!currentUser) {
        return;
    }


    acceptBtn.disabled =
        true;

    declineBtn.disabled =
        true;


    acceptBtn.innerHTML = `

        <i class="fa-solid fa-spinner fa-spin"></i>

        <span>Accepting...</span>

    `;


    try {

        /*
         * Your Supabase setup uses an RPC to accept
         * requests and create both friendship rows.
         *
         * We send the request ID to the RPC.
         */

        const {
            error
        } =
            await supabaseClient.rpc(
                "accept_friend_request",
                {
                    request_id:
                        requestId
                }
            );


        if (error) {
            throw error;
        }


        showToast(
            "Friend request accepted!"
        );


        await loadFriendRequests();

        await loadFriends();


        if (
            typeof loadProfileStats ===
            "function"
        ) {

            await loadProfileStats();
        }


        if (
            typeof loadConversations ===
            "function"
        ) {

            await loadConversations();
        }


    } catch (error) {

        console.error(
            "Accept friend request error:",
            error
        );


        showToast(
            error.message ||
            "Could not accept request.",
            "error"
        );


        acceptBtn.disabled =
            false;

        declineBtn.disabled =
            false;


        acceptBtn.innerHTML = `

            <i class="fa-solid fa-check"></i>

            <span>Accept</span>

        `;

    }
}


// ======================================================
// DECLINE FRIEND REQUEST
// ======================================================

async function declineFriendRequest(
    requestId,
    acceptBtn,
    declineBtn
) {

    if (!currentUser) {
        return;
    }


    acceptBtn.disabled =
        true;

    declineBtn.disabled =
        true;


    declineBtn.innerHTML = `

        <i class="fa-solid fa-spinner fa-spin"></i>

        <span>Declining...</span>

    `;


    try {

        const {
            error
        } =
            await supabaseClient
                .from("friend_requests")
                .update({
                    status: "declined"
                })
                .eq(
                    "id",
                    requestId
                )
                .eq(
                    "receiver_id",
                    currentUser.id
                );


        if (error) {
            throw error;
        }


        showToast(
            "Friend request declined."
        );


        await loadFriendRequests();


    } catch (error) {

        console.error(
            "Decline request error:",
            error
        );


        showToast(
            error.message ||
            "Could not decline request.",
            "error"
        );


        acceptBtn.disabled =
            false;

        declineBtn.disabled =
            false;


        declineBtn.innerHTML = `

            <i class="fa-solid fa-xmark"></i>

            <span>Decline</span>

        `;

    }
}


// ======================================================
// LOAD FRIENDS
// ======================================================

async function loadFriends() {

    if (
        !currentUser ||
        !friendsList
    ) {
        return;
    }


    friendsList.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <p>Loading friends...</p>

        </div>

    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("friendships")
                .select(`
                    friend_id,
                    created_at,
                    friend:profiles!friendships_friend_id_fkey (
                        id,
                        name,
                        username,
                        avatar_url,
                        bio
                    )
                `)
                .eq(
                    "user_id",
                    currentUser.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {
            throw error;
        }


        const friends =
            (data || [])
                .map(row => row.friend)
                .filter(Boolean);


        renderFriends(
            friends
        );


    } catch (error) {

        console.error(
            "Load friends error:",
            error
        );


        friendsList.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>Could not load friends</h3>

                <p>
                    ${escapeHTML(
                        error.message ||
                        "Please try again."
                    )}
                </p>

            </div>

        `;

    }
}


// ======================================================
// RENDER FRIENDS
// ======================================================

function renderFriends(friends) {

    if (!friendsList) {
        return;
    }


    friendsList.innerHTML = "";


    if (!friends.length) {

        friendsList.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-user-group"></i>

                <h3>No friends yet</h3>

                <p>
                    Discover people and send a friend request.
                </p>

            </div>

        `;

        return;
    }


    friends.forEach(friend => {

        const card =
            document.createElement("div");


        card.className =
            "friend-card";


        // AVATAR

        const avatar =
            document.createElement("div");


        avatar.className =
            "user-avatar";


        setAvatarElement(
            avatar,
            friend
        );


        // INFORMATION

        const info =
            document.createElement("div");


        info.className =
            "friend-info";


        const name =
            document.createElement("strong");


        name.textContent =
            friend.name || "User";


        const username =
            document.createElement("span");


        username.textContent =
            `@${friend.username || "username"}`;


        info.appendChild(
            name
        );


        info.appendChild(
            username
        );


        // MESSAGE BUTTON

        const messageBtn =
            document.createElement("button");


        messageBtn.type =
            "button";


        messageBtn.className =
            "message-person-btn";


        messageBtn.innerHTML = `

            <i class="fa-regular fa-message"></i>

            <span>Message</span>

        `;


        messageBtn.addEventListener(
            "click",
            async () => {

                await openPage(
                    "messagesPage"
                );


                if (
                    typeof openConversation ===
                    "function"
                ) {

                    await openConversation(
                        friend
                    );
                }

            }
        );


        card.appendChild(
            avatar
        );


        card.appendChild(
            info
        );


        card.appendChild(
            messageBtn
        );


        friendsList.appendChild(
            card
        );

    });

}
// ======================================================
// LOAD PROFILE STATS
// ======================================================

async function loadProfileStats() {

    if (!currentUser) {
        return;
    }

    try {

        // Count friends
        const {
            count: friendsCount,
            error: friendsError
        } = await supabaseClient
            .from("friendships")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("user_id", currentUser.id);


        if (friendsError) {
            throw friendsError;
        }


        // Count posts / Chirps
        const {
            count: postsCount,
            error: postsError
        } = await supabaseClient
            .from("posts")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("user_id", currentUser.id);


        if (postsError) {
            throw postsError;
        }


        // Update Friends number
        const friendsElement =
            document.getElementById("profileFriendsCount");

        if (friendsElement) {
            friendsElement.textContent =
                friendsCount ?? 0;
        }


        // Update Chirps number
        const postsElement =
            document.getElementById("profilePostsCount");

        if (postsElement) {
            postsElement.textContent =
                postsCount ?? 0;
        }


    } catch (error) {

        console.error(
            "Profile stats error:",
            error
        );
    }
}
// ======================================================
// CREATE / PUBLISH CHIRP
// ======================================================
// ======================================================
// CREATE / PUBLISH CHIRP
// ======================================================

// ======================================================
// GOOGLE SIGN IN
// ======================================================

const googleSignInBtn =
    document.getElementById("googleSignInBtn");

googleSignInBtn?.addEventListener(
    "click",
    async () => {

        try {

            googleSignInBtn.disabled = true;

            googleSignInBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Connecting...</span>
            `;

            const { error } =
                await supabaseClient.auth.signInWithOAuth({
                    provider: "google",

                    options: {
                        redirectTo:
                            "https://danny-x-247.github.io/chirp/"
                    }
                });

            if (error) {
                throw error;
            }

        } catch (error) {

            console.error(
                "Google sign-in error:",
                error
            );

            showToast(
                error.message ||
                "Could not sign in with Google.",
                "error"
            );

            googleSignInBtn.disabled = false;

            googleSignInBtn.innerHTML = `
                <i class="fa-brands fa-google"></i>
                <span>Continue with Google</span>
            `;
        }
    }
);

const postInput =
    document.getElementById("postInput");

const publishPostBtn =
    document.getElementById("publishPostBtn");

const postCharacterCount =
    document.getElementById("postCharacterCount");

const postImageBtn =
    document.getElementById("postImageBtn");

const postVideoBtn =
    document.getElementById("postVideoBtn");

const postImageInput =
    document.getElementById("postImageInput");

const postVideoInput =
    document.getElementById("postVideoInput");

const postMediaPreview =
    document.getElementById("postMediaPreview");

const postImagePreview =
    document.getElementById("postImagePreview");

const postVideoPreview =
    document.getElementById("postVideoPreview");

const removePostMediaBtn =
    document.getElementById("removePostMediaBtn");


let selectedPostMedia = null;
let selectedPostMediaType = null;
let selectedPostMediaPreviewURL = null;


// ======================================================
// CHARACTER COUNTER
// ======================================================

postInput?.addEventListener(
    "input",
    () => {

        if (postCharacterCount) {

            postCharacterCount.textContent =
                `${postInput.value.length}/280`;
        }
    }
);


// ======================================================
// IMAGE BUTTON
// ======================================================

postImageBtn?.addEventListener(
    "click",
    () => {

        postImageInput?.click();
    }
);


// ======================================================
// VIDEO BUTTON
// ======================================================

postVideoBtn?.addEventListener(
    "click",
    () => {

        postVideoInput?.click();
    }
);


// ======================================================
// IMAGE SELECTED
// ======================================================

postImageInput?.addEventListener(
    "change",
    () => {

        const file =
            postImageInput.files?.[0];

        if (!file) {
            return;
        }


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (!allowedTypes.includes(file.type)) {

            showToast(
                "Choose a JPG, PNG or WebP image.",
                "error"
            );

            postImageInput.value = "";

            return;
        }


        if (file.size > 5 * 1024 * 1024) {

            showToast(
                "Image must be 5 MB or smaller.",
                "error"
            );

            postImageInput.value = "";

            return;
        }


        setPostMedia(
            file,
            "image"
        );
    }
);


// ======================================================
// VIDEO SELECTED
// ======================================================

postVideoInput?.addEventListener(
    "change",
    () => {

        const file =
            postVideoInput.files?.[0];

        if (!file) {
            return;
        }


        const allowedTypes = [
            "video/mp4",
            "video/webm"
        ];


        if (!allowedTypes.includes(file.type)) {

            showToast(
                "Choose an MP4 or WebM video.",
                "error"
            );

            postVideoInput.value = "";

            return;
        }


        if (file.size > 25 * 1024 * 1024) {

            showToast(
                "Video must be 25 MB or smaller.",
                "error"
            );

            postVideoInput.value = "";

            return;
        }


        setPostMedia(
            file,
            "video"
        );
    }
);


// ======================================================
// SET POST MEDIA
// ======================================================

function setPostMedia(file, type) {

    clearPostMediaPreview();


    selectedPostMedia = file;

    selectedPostMediaType = type;

    selectedPostMediaPreviewURL =
        URL.createObjectURL(file);


    postMediaPreview
        ?.classList
        .remove("hidden");


    // IMAGE

    if (type === "image") {

        if (postImagePreview) {

            postImagePreview.src =
                selectedPostMediaPreviewURL;

            postImagePreview
                .classList
                .remove("hidden");
        }


        postVideoPreview
            ?.classList
            .add("hidden");
    }


    // VIDEO

    if (type === "video") {

        if (postVideoPreview) {

            postVideoPreview.src =
                selectedPostMediaPreviewURL;

            postVideoPreview
                .classList
                .remove("hidden");
        }


        postImagePreview
            ?.classList
            .add("hidden");
    }
}


// ======================================================
// REMOVE SELECTED MEDIA
// ======================================================

removePostMediaBtn?.addEventListener(
    "click",
    () => {

        clearPostMediaPreview();
    }
);


// ======================================================
// CLEAR MEDIA PREVIEW
// ======================================================

function clearPostMediaPreview() {

    if (selectedPostMediaPreviewURL) {

        URL.revokeObjectURL(
            selectedPostMediaPreviewURL
        );
    }


    selectedPostMedia = null;

    selectedPostMediaType = null;

    selectedPostMediaPreviewURL = null;


    if (postImageInput) {

        postImageInput.value = "";
    }


    if (postVideoInput) {

        postVideoInput.value = "";
    }


    if (postImagePreview) {

        postImagePreview.src = "";

        postImagePreview
            .classList
            .add("hidden");
    }


    if (postVideoPreview) {

        postVideoPreview.pause();

        postVideoPreview
            .removeAttribute("src");

        postVideoPreview.load();

        postVideoPreview
            .classList
            .add("hidden");
    }


    postMediaPreview
        ?.classList
        .add("hidden");
}


// ======================================================
// UPLOAD POST MEDIA
// ======================================================

async function uploadPostMedia(
    file,
    type
) {

    if (!currentUser) {

        throw new Error(
            "You are not signed in."
        );
    }


    let extension =
        file.name
            .split(".")
            .pop()
            ?.toLowerCase();


    if (!extension) {

        extension =
            type === "image"
                ? "jpg"
                : "mp4";
    }


    if (extension === "jpeg") {

        extension = "jpg";
    }


    const uniqueName =

        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"

            ? crypto.randomUUID()

            : `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`;


    const filePath =

        `${currentUser.id}/${uniqueName}.${extension}`;


    const {
        error: uploadError
    } =

        await supabaseClient
            .storage
            .from("post-media")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",

                    upsert: false,

                    contentType:
                        file.type
                }
            );


    if (uploadError) {

        throw uploadError;
    }


    const {
        data
    } =

        supabaseClient
            .storage
            .from("post-media")
            .getPublicUrl(
                filePath
            );


    if (!data?.publicUrl) {

        throw new Error(
            "Could not get media URL."
        );
    }


    return {

        url:
            data.publicUrl,

        path:
            filePath
    };
}


// ======================================================
// DELETE UPLOADED MEDIA
// ======================================================

async function deleteUploadedPostMedia(
    filePath
) {

    if (!filePath) {
        return;
    }


    try {

        await supabaseClient
            .storage
            .from("post-media")
            .remove([
                filePath
            ]);

    } catch (error) {

        console.error(
            "Post media cleanup error:",
            error
        );
    }
}


// ======================================================
// PUBLISH CHIRP
// ======================================================

publishPostBtn?.addEventListener(
    "click",
    async () => {

        if (!currentUser) {

            showToast(
                "You are not signed in.",
                "error"
            );

            return;
        }


        const content =
            postInput?.value
                .trim() || "";


        // User needs text or media

        if (
            !content &&
            !selectedPostMedia
        ) {

            showToast(
                "Write something or add an image or video.",
                "error"
            );

            return;
        }


        if (content.length > 280) {

            showToast(
                "Your Chirp must be 280 characters or less.",
                "error"
            );

            return;
        }


        publishPostBtn.disabled =
            true;


        publishPostBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Posting...
        `;


        let uploadedMediaPath = null;


        try {

            let imageURL = null;

            let videoURL = null;


            // ==========================================
            // UPLOAD MEDIA
            // ==========================================

            if (
                selectedPostMedia &&
                selectedPostMediaType
            ) {

                const uploaded =
                    await uploadPostMedia(
                        selectedPostMedia,
                        selectedPostMediaType
                    );


                uploadedMediaPath =
                    uploaded.path;


                if (
                    selectedPostMediaType ===
                    "image"
                ) {

                    imageURL =
                        uploaded.url;
                }


                if (
                    selectedPostMediaType ===
                    "video"
                ) {

                    videoURL =
                        uploaded.url;
                }
            }


            // ==========================================
            // INSERT INTO SUPABASE
            // ==========================================

            const {
                error
            } =

                await supabaseClient
                    .from("posts")
                    .insert({

                        user_id:
                            currentUser.id,

                        content:
                            content,

                        image_url:
                            imageURL,

                        video_url:
                            videoURL
                    });


            if (error) {

                throw error;
            }


            // ==========================================
            // RESET
            // ==========================================

            if (postInput) {

                postInput.value = "";
            }


            if (postCharacterCount) {

                postCharacterCount.textContent =
                    "0/280";
            }


            clearPostMediaPreview();


            showToast(
                "Chirp posted!"
            );


            // ==========================================
            // RELOAD POSTS
            // ==========================================

            await loadPosts();


            if (
                typeof loadProfileStats ===
                "function"
            ) {

                await loadProfileStats();
            }


        } catch (error) {

            console.error(
                "Publish Chirp error:",
                error
            );


            if (uploadedMediaPath) {

                await deleteUploadedPostMedia(
                    uploadedMediaPath
                );
            }


            showToast(
                error.message ||
                "Could not publish Chirp.",
                "error"
            );


        } finally {

            publishPostBtn.disabled =
                false;


            publishPostBtn.textContent =
                "Chirp";
        }
    }
);


// ======================================================
// LOAD CHIRPS
// ======================================================

// ======================================================
// LOAD CHIRPS — LIKES + COMMENTS
// ======================================================

async function loadPosts() {

    const postsContainer =
        document.getElementById("postsContainer");

    if (!postsContainer) return;

    postsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Loading Chirps...</p>
        </div>
    `;

    try {

        const { data, error } =
            await supabaseClient
                .from("posts")
                .select(`
                    id,
                    user_id,
                    content,
                    image_url,
                    video_url,
                    created_at,

                    profiles (
                        id,
                        name,
                        username,
                        avatar_url
                    ),

                    post_likes (
                        user_id
                    ),

                    post_comments (
                        id,
                        user_id,
                        content,
                        created_at,
                        profiles!post_comments_user_id_fkey (
                            id,
                            name,
                            username,
                            avatar_url
                        )
                    )
                `)
                .order("created_at", {
                    ascending: false
                });

        if (error) {
            throw error;
        }

        postsContainer.innerHTML = "";

        if (!data || data.length === 0) {

            postsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-comment"></i>
                    <h3>No Chirps yet</h3>
                    <p>Be the first person to Chirp.</p>
                </div>
            `;

            return;
        }

        data.forEach(post => {
            renderPost(post, postsContainer);
        });

    } catch (error) {

        console.error(
            "Load Chirps error:",
            error
        );

        postsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>Could not load Chirps</h3>

                <p>
                    ${escapeHTML(
                        error.message ||
                        "Please try again."
                    )}
                </p>
            </div>
        `;
    }
}


// ======================================================
// RENDER ONE CHIRP
// ======================================================

function renderPost(post, container) {

    const profile =
        post.profiles || {};

    const likes =
        post.post_likes || [];

    const comments =
        post.post_comments || [];

    const isLiked =
        likes.some(
            like =>
                like.user_id === currentUser?.id
        );


    // ==================================================
    // POST
    // ==================================================

    const article =
        document.createElement("article");

    article.className =
        "post-card";

    article.dataset.postId =
        post.id;


    // ==================================================
    // HEADER
    // ==================================================

    const header =
        document.createElement("div");

    header.className =
        "post-header";


    const avatar =
        document.createElement("div");

    avatar.className =
        "user-avatar";

    setAvatarElement(
        avatar,
        profile
    );


    const userInfo =
        document.createElement("div");

    userInfo.className =
        "post-user-info";


    const name =
        document.createElement("strong");

    name.textContent =
        profile.name ||
        "Chirp User";


    const details =
        document.createElement("span");

    details.textContent =
        `@${profile.username || "user"} · ${formatTime(
            post.created_at
        )}`;


    userInfo.appendChild(name);
    userInfo.appendChild(details);

    header.appendChild(avatar);
    header.appendChild(userInfo);

    article.appendChild(header);


    // ==================================================
    // POST TEXT
    // ==================================================

    if (
        post.content &&
        post.content.trim()
    ) {

        const text =
            document.createElement("p");

        text.className =
            "post-content";

        text.textContent =
            post.content;

        article.appendChild(text);
    }


    // ==================================================
    // POST IMAGE
    // ==================================================

    if (post.image_url) {

        const media =
            document.createElement("div");

        media.className =
            "post-media";


        const image =
            document.createElement("img");

        image.src =
            post.image_url;

        image.alt =
            "Chirp image";

        image.loading =
            "lazy";


        media.appendChild(image);

        article.appendChild(media);
    }


    // ==================================================
    // POST VIDEO
    // ==================================================

    if (post.video_url) {

        const media =
            document.createElement("div");

        media.className =
            "post-media";


        const video =
            document.createElement("video");

        video.src =
            post.video_url;

        video.controls =
            true;

        video.preload =
            "metadata";

        video.playsInline =
            true;


        media.appendChild(video);

        article.appendChild(media);
    }


    // ==================================================
    // ACTION BUTTONS
    // ==================================================

    const actions =
        document.createElement("div");

    actions.className =
        "post-actions";


    // ==================================================
    // LIKE BUTTON
    // ==================================================

    const likeButton =
        document.createElement("button");

    likeButton.type =
        "button";

    likeButton.className =
        "post-action-btn";


    if (isLiked) {

        likeButton.classList.add(
            "liked"
        );
    }


    const likeIcon =
        document.createElement("i");

    likeIcon.className =
        isLiked
            ? "fa-solid fa-heart"
            : "fa-regular fa-heart";


    const likeCount =
        document.createElement("span");

    likeCount.textContent =
        likes.length > 0
            ? `${likes.length}`
            : "Like";


    likeButton.appendChild(
        likeIcon
    );

    likeButton.appendChild(
        likeCount
    );


    // ==================================================
    // COMMENT BUTTON
    // ==================================================

    const commentButton =
        document.createElement("button");

    commentButton.type =
        "button";

    commentButton.className =
        "post-action-btn";


    const commentIcon =
        document.createElement("i");

    commentIcon.className =
        "fa-regular fa-comment";


    const commentCount =
        document.createElement("span");

    commentCount.textContent =
        comments.length > 0
            ? `${comments.length}`
            : "Comment";


    commentButton.appendChild(
        commentIcon
    );

    commentButton.appendChild(
        commentCount
    );


    actions.appendChild(
        likeButton
    );

    actions.appendChild(
        commentButton
    );

    article.appendChild(
        actions
    );


    // ==================================================
    // COMMENTS SECTION
    // ==================================================

    const commentsSection =
        document.createElement("div");

    commentsSection.className =
        "comments-section hidden";


    const commentsList =
        document.createElement("div");

    commentsList.className =
        "comments-list";


    // ==================================================
    // RENDER COMMENTS
    // ==================================================

    comments
        .sort(
            (a, b) =>
                new Date(a.created_at) -
                new Date(b.created_at)
        )
        .forEach(comment => {

            const commentProfile =
                comment.profiles || {};


            const commentItem =
                document.createElement("div");

            commentItem.className =
                "comment-item";


            const commentAvatar =
                document.createElement("div");

            commentAvatar.className =
                "comment-avatar";


            setAvatarElement(
                commentAvatar,
                commentProfile
            );


            const commentBody =
                document.createElement("div");

            commentBody.className =
                "comment-body";


            const commentName =
                document.createElement("strong");

            commentName.textContent =
                commentProfile.name ||
                "Chirp User";


            const commentText =
                document.createElement("p");

            commentText.textContent =
                comment.content;


            commentBody.appendChild(
                commentName
            );

            commentBody.appendChild(
                commentText
            );


            commentItem.appendChild(
                commentAvatar
            );

            commentItem.appendChild(
                commentBody
            );


            commentsList.appendChild(
                commentItem
            );
        });


    // ==================================================
    // COMMENT COMPOSER
    // ==================================================

    const commentComposer =
        document.createElement("div");

    commentComposer.className =
        "comment-composer";


    const commentInput =
        document.createElement("input");

    commentInput.type =
        "text";

    commentInput.placeholder =
        "Write a comment...";

    commentInput.maxLength =
        500;


    const commentSendButton =
        document.createElement("button");

    commentSendButton.type =
        "button";

    commentSendButton.title =
        "Send comment";

    commentSendButton.setAttribute(
        "aria-label",
        "Send comment"
    );


    const sendIcon =
        document.createElement("i");

    sendIcon.className =
        "fa-solid fa-paper-plane";

    commentSendButton.appendChild(
        sendIcon
    );


    commentComposer.appendChild(
        commentInput
    );

    commentComposer.appendChild(
        commentSendButton
    );


    commentsSection.appendChild(
        commentsList
    );

    commentsSection.appendChild(
        commentComposer
    );


    article.appendChild(
        commentsSection
    );


    // ==================================================
    // LIKE CLICK
    // ==================================================

    likeButton.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                showToast(
                    "Sign in to like Chirps.",
                    "error"
                );

                return;
            }


            likeButton.disabled =
                true;


            try {

                const currentlyLiked =
                    likeButton.classList.contains(
                        "liked"
                    );


                // ======================================
                // UNLIKE
                // ======================================

                if (currentlyLiked) {

                    const { error } =
                        await supabaseClient
                            .from("post_likes")
                            .delete()
                            .eq(
                                "post_id",
                                post.id
                            )
                            .eq(
                                "user_id",
                                currentUser.id
                            );


                    if (error) {
                        throw error;
                    }


                } else {

                    // ==================================
                    // LIKE
                    // ==================================

                    const { error } =
                        await supabaseClient
                            .from("post_likes")
                            .insert({

                                post_id:
                                    post.id,

                                user_id:
                                    currentUser.id
                            });


                    if (error) {
                        throw error;
                    }
                }


                await loadPosts();


            } catch (error) {

                console.error(
                    "Like error:",
                    error
                );


                showToast(
                    error.message ||
                    "Could not update like.",
                    "error"
                );


            } finally {

                likeButton.disabled =
                    false;
            }
        }
    );


    // ==================================================
    // OPEN / CLOSE COMMENTS
    // ==================================================

    commentButton.addEventListener(
        "click",
        () => {

            commentsSection
                .classList
                .toggle("hidden");


            if (
                !commentsSection
                    .classList
                    .contains("hidden")
            ) {

                commentInput.focus();
            }
        }
    );


    // ==================================================
    // SEND COMMENT
    // ==================================================

    async function submitComment() {

        if (!currentUser) {

            showToast(
                "Sign in to comment.",
                "error"
            );

            return;
        }


        const content =
            commentInput.value.trim();


        if (!content) {

            return;
        }


        if (content.length > 500) {

            showToast(
                "Comments must be 500 characters or less.",
                "error"
            );

            return;
        }


        commentSendButton.disabled =
            true;

        commentInput.disabled =
            true;


        try {

            const { error } =
                await supabaseClient
                    .from("post_comments")
                    .insert({

                        post_id:
                            post.id,

                        user_id:
                            currentUser.id,

                        content:
                            content
                    });


            if (error) {
                throw error;
            }


            commentInput.value = "";


            showToast(
                "Comment added!"
            );


            await loadPosts();


        } catch (error) {

            console.error(
                "Comment error:",
                error
            );


            showToast(
                error.message ||
                "Could not add comment.",
                "error"
            );


        } finally {

            commentSendButton.disabled =
                false;

            commentInput.disabled =
                false;
        }
    }


    // SEND BUTTON

    commentSendButton.addEventListener(
        "click",
        submitComment
    );


    // ENTER KEY

    commentInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                submitComment();
            }
        }
    );


    // ==================================================
    // ADD CHIRP TO FEED
    // ==================================================

    container.appendChild(
        article
    );
}

// ======================================================
// CHIRP LIGHT / DARK MODE
// ======================================================

const themeToggleBtn =
    document.getElementById("themeToggleBtn");

const themeIcon =
    document.getElementById("themeIcon");

const themeText =
    document.getElementById("themeText");


// Apply a theme
function applyChirpTheme(theme) {

    const darkMode =
        theme === "dark";

    document.body.classList.toggle(
        "dark-theme",
        darkMode
    );

    if (themeIcon) {
        themeIcon.className =
            darkMode
                ? "fa-solid fa-sun"
                : "fa-solid fa-moon";
    }

    if (themeText) {
        themeText.textContent =
            darkMode
                ? "Light Mode"
                : "Dark Mode";
    }
}


// Load saved theme
const savedChirpTheme =
    localStorage.getItem("chirp-theme") || "light";

applyChirpTheme(savedChirpTheme);


// Switch theme when button is clicked
themeToggleBtn?.addEventListener(
    "click",
    () => {

        const currentlyDark =
            document.body.classList.contains(
                "dark-theme"
            );

        const newTheme =
            currentlyDark
                ? "light"
                : "dark";

        localStorage.setItem(
            "chirp-theme",
            newTheme
        );

        applyChirpTheme(newTheme);
    }
);