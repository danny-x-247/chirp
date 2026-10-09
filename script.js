// ==========================================
// CHIRP - SUPABASE CONNECTION
// ==========================================

// Replace these two values with yours
const SUPABASE_URL = "https://dciiylghdndcpmtxpgkn.supabase.co";
const SUPABASE_KEY = "sb_publishable_URsgVb7R6G8ZGE_gTqStHQ_i9vkIj4G";

// Connect Chirp to Supabase
const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Chirp connected to Supabase");

// ==========================================
// CHIRP - ELEMENTS
// ==========================================

const loadingScreen = document.getElementById("loadingScreen");
const authPage = document.getElementById("authPage");
const app = document.getElementById("app");

const loginFormContainer =
    document.getElementById("loginFormContainer");

const registerFormContainer =
    document.getElementById("registerFormContainer");

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const showRegisterBtn =
    document.getElementById("showRegisterBtn");

const showLoginBtn =
    document.getElementById("showLoginBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// SHOW TOAST MESSAGE
// ==========================================

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    const toastIcon = document.getElementById("toastIcon");

    toastMessage.textContent = message;

    toast.classList.remove("hidden", "error");

    if (type === "error") {

        toast.classList.add("error");

        toastIcon.className =
            "fa-solid fa-circle-exclamation";

    } else {

        toastIcon.className =
            "fa-solid fa-circle-check";
    }

    setTimeout(() => {
        toast.classList.add("hidden");
    }, 3500);
}


// ==========================================
// SWITCH LOGIN / REGISTER
// ==========================================

showRegisterBtn.addEventListener("click", () => {

    loginFormContainer.classList.add("hidden");
    registerFormContainer.classList.remove("hidden");

});


showLoginBtn.addEventListener("click", () => {

    registerFormContainer.classList.add("hidden");
    loginFormContainer.classList.remove("hidden");

});


// ==========================================
// PASSWORD VISIBILITY
// ==========================================

document.querySelectorAll(".password-toggle")
    .forEach(button => {

        button.addEventListener("click", () => {

            const target =
                document.getElementById(
                    button.dataset.target
                );

            const icon =
                button.querySelector("i");

            if (target.type === "password") {

                target.type = "text";

                icon.className =
                    "fa-regular fa-eye-slash";

            } else {

                target.type = "password";

                icon.className =
                    "fa-regular fa-eye";
            }

        });

    });


// ==========================================
// REGISTER
// ==========================================

registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name =
        document.getElementById("registerName")
            .value.trim();

    const username =
        document.getElementById("registerUsername")
            .value.trim()
            .toLowerCase();

    const email =
        document.getElementById("registerEmail")
            .value.trim();

    const password =
        document.getElementById("registerPassword")
            .value;

    const registerBtn =
        document.getElementById("registerBtn");


    // Username validation

    const usernamePattern = /^[a-z0-9_]+$/;

    if (!usernamePattern.test(username)) {

        showToast(
            "Username can only contain letters, numbers and underscores.",
            "error"
        );

        return;
    }


    if (username.length < 3) {

        showToast(
            "Username must contain at least 3 characters.",
            "error"
        );

        return;
    }


    registerBtn.disabled = true;
    registerBtn.textContent = "Creating account...";


    try {

        // Check whether username already exists

        const {
            data: existingUsername,
            error: usernameError
        } = await supabaseClient
            .from("profiles")
            .select("username")
            .eq("username", username)
            .maybeSingle();


        if (usernameError) {
            throw usernameError;
        }


        if (existingUsername) {

            showToast(
                "That username is already taken.",
                "error"
            );

            return;
        }


        // Create Supabase account

        const {
            data,
            error
        } = await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

                data: {
                    name: name,
                    username: username
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

            await loadApplication();

        } else {

            showToast(
                "Account created. Check your email to confirm your account."
            );

            registerFormContainer.classList.add("hidden");
            loginFormContainer.classList.remove("hidden");
        }


    } catch (error) {

        console.error(error);

        showToast(
            error.message || "Unable to create account.",
            "error"
        );

    } finally {

        registerBtn.disabled = false;
        registerBtn.textContent = "Create account";

    }

});


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("loginEmail")
            .value.trim();

    const password =
        document.getElementById("loginPassword")
            .value;

    const loginBtn =
        document.getElementById("loginBtn");


    loginBtn.disabled = true;
    loginBtn.textContent = "Signing in...";


    try {

        const {
            data,
            error
        } = await supabaseClient.auth
            .signInWithPassword({

                email: email,
                password: password

            });


        if (error) {
            throw error;
        }


        if (!data.user) {

            throw new Error(
                "Unable to sign in."
            );

        }


        loginForm.reset();

        showToast(
            "Welcome back!"
        );

        await loadApplication();


    } catch (error) {

        console.error(error);

        showToast(
            error.message || "Unable to sign in.",
            "error"
        );

    } finally {

        loginBtn.disabled = false;
        loginBtn.textContent = "Sign in";

    }

});


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener("click", async () => {

    try {

        const { error } =
            await supabaseClient.auth.signOut();

        if (error) {
            throw error;
        }

        app.classList.add("hidden");
        authPage.classList.remove("hidden");

        showToast("Signed out successfully.");

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to sign out.",
            "error"
        );

    }

});


// ==========================================
// LOAD USER PROFILE
// ==========================================

async function getCurrentProfile() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError) {
        throw userError;
    }


    if (!user) {
        return null;
    }


    const {
        data: profile,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();


    if (error) {
        throw error;
    }


    return profile;
}


// ==========================================
// DISPLAY PROFILE
// ==========================================

function displayCurrentProfile(profile) {

    if (!profile) {
        return;
    }


    const initial =
        profile.name
            ?.charAt(0)
            .toUpperCase() || "U";


    // Sidebar

    document.getElementById("sidebarName")
        .textContent = profile.name;

    document.getElementById("sidebarUsername")
        .textContent = `@${profile.username}`;

    document.getElementById("sidebarAvatar")
        .textContent = initial;


    // Post composer

    document.getElementById("composerAvatar")
        .textContent = initial;


    // Profile page

    document.getElementById("profileName")
        .textContent = profile.name;

    document.getElementById("profileUsername")
        .textContent = `@${profile.username}`;

    document.getElementById("profileBio")
        .textContent =
            profile.bio ||
            "Welcome to my Chirp profile.";

    document.getElementById("profileAvatar")
        .textContent = initial;

}


// ==========================================
// LOAD APPLICATION
// ==========================================

async function loadApplication() {

    try {

        const profile =
            await getCurrentProfile();


        if (!profile) {

            app.classList.add("hidden");
            app.classList.remove("hidden");

            await loadPosts();
            await loadProfileStats();

            return;
        }


        displayCurrentProfile(profile);


        authPage.classList.add("hidden");
        app.classList.remove("hidden");


    } catch (error) {

        console.error(
            "Application loading error:",
            error
        );

        showToast(
            "Unable to load your Chirp profile.",
            "error"
        );

    }

}


// ==========================================
// CHECK LOGIN WHEN PAGE OPENS
// ==========================================

async function initializeChirp() {

    try {

        const {
            data: { session }
        } = await supabaseClient.auth
            .getSession();


        if (session) {

            await loadApplication();

        } else {

            app.classList.add("hidden");
            authPage.classList.remove("hidden");

        }


    } catch (error) {

        console.error(error);

        authPage.classList.remove("hidden");

    } finally {

        loadingScreen.classList.add("hidden");

    }

}


// ==========================================
// WATCH AUTH CHANGES
// ==========================================

supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

        if (
            event === "SIGNED_IN" &&
            session
        ) {

            await loadApplication();

        }

        if (event === "SIGNED_OUT") {

            app.classList.add("hidden");
            authPage.classList.remove("hidden");

        }

    }
);


// ==========================================
// START CHIRP
// ==========================================

initializeChirp();

// ==========================================
// CHIRP - SEARCH FOR PEOPLE
// ==========================================

const peopleSearchInput =
    document.getElementById("peopleSearchInput");

const peopleResults =
    document.getElementById("peopleResults");


// Search while typing
if (peopleSearchInput) {

    peopleSearchInput.addEventListener(
        "input",
        async () => {

            const query =
                peopleSearchInput.value.trim();

            await searchPeople(query);

        }
    );

}


// ==========================================
// SEARCH REGISTERED USERS
// ==========================================

async function searchPeople(query = "") {

    if (!peopleResults) {
        return;
    }

    try {

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();


        if (!user) {
            return;
        }


        let request =
            supabaseClient
                .from("profiles")
                .select(
                    "id, name, username, bio, avatar_url"
                )
                .neq("id", user.id)
                .limit(30);


        // Search by name or username
        if (query) {

            const safeQuery =
                query
                    .replace(/[%_,()]/g, "")
                    .trim();

            if (safeQuery) {

                request =
                    request.or(
                        `name.ilike.%${safeQuery}%,username.ilike.%${safeQuery}%`
                    );

            }

        }


        const {
            data: profiles,
            error
        } = await request;


        if (error) {
            throw error;
        }


        if (!profiles || profiles.length === 0) {

            peopleResults.innerHTML = "";

            const empty =
                document.createElement("div");

            empty.className = "empty-state";

            const title =
                document.createElement("h3");

            title.textContent =
                query
                    ? "No users found"
                    : "No other users yet";

            const description =
                document.createElement("p");

            description.textContent =
                query
                    ? "Try searching for another name or username."
                    : "Other Chirp users will appear here.";

            empty.append(
                title,
                description
            );

            peopleResults.appendChild(empty);

            return;
        }


        // Get friendships
        const {
            data: friendships
        } = await supabaseClient
            .from("friendships")
            .select("friend_id")
            .eq("user_id", user.id);


        const friendIds =
            new Set(
                (friendships || [])
                    .map(friend => friend.friend_id)
            );


        // Get friend requests involving current user
        const {
            data: requests
        } = await supabaseClient
            .from("friend_requests")
            .select(
                "id, sender_id, receiver_id, status"
            )
            .or(
                `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
            );


        peopleResults.innerHTML = "";


        profiles.forEach(profile => {

            const card =
                createPersonCard(
                    profile,
                    user.id,
                    friendIds,
                    requests || []
                );

            peopleResults.appendChild(card);

        });


    } catch (error) {

        console.error(
            "People search error:",
            error
        );

        showToast(
            "Unable to search for people.",
            "error"
        );

    }

}


// ==========================================
// CREATE PERSON CARD
// ==========================================

function createPersonCard(
    profile,
    currentUserId,
    friendIds,
    requests
) {

    const card =
        document.createElement("div");

    card.className = "person-card";


    const avatar =
        document.createElement("div");

    avatar.className = "user-avatar";

    avatar.textContent =
        profile.name
            ?.charAt(0)
            .toUpperCase() || "U";


    const information =
        document.createElement("div");

    information.className =
        "person-info";


    const name =
        document.createElement("strong");

    name.textContent =
        profile.name || "Chirp User";


    const username =
        document.createElement("span");

    username.textContent =
        `@${profile.username}`;


    information.append(
        name,
        username
    );


    const button =
        document.createElement("button");

    button.className =
        "friend-action-btn";


    // Already friends
    if (friendIds.has(profile.id)) {

        button.textContent = "Friends";

        button.disabled = true;

    } else {

        const outgoing =
            requests.find(request =>
                request.sender_id === currentUserId &&
                request.receiver_id === profile.id &&
                request.status === "pending"
            );


        const incoming =
            requests.find(request =>
                request.sender_id === profile.id &&
                request.receiver_id === currentUserId &&
                request.status === "pending"
            );


        if (outgoing) {

            button.textContent =
                "Request sent";

            button.disabled = true;

        } else if (incoming) {

            button.textContent =
                "Accept";

            button.addEventListener(
                "click",
                async () => {

                    await acceptFriendRequest(
                        incoming.id
                    );

                }
            );

        } else {

            button.textContent =
                "Add friend";

            button.addEventListener(
                "click",
                async () => {

                    await sendFriendRequest(
                        profile.id
                    );

                }
            );

        }

    }


    card.append(
        avatar,
        information,
        button
    );


    return card;
}


// ==========================================
// SEND FRIEND REQUEST
// ==========================================

async function sendFriendRequest(receiverId) {

    try {

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();


        if (!user) {
            throw new Error(
                "You must be signed in."
            );
        }


        // Check for an existing request in either direction
        const {
            data: existingRequests,
            error: checkError
        } = await supabaseClient
            .from("friend_requests")
            .select("*")
            .or(
                `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
            );


        if (checkError) {
            throw checkError;
        }


        const pending =
            (existingRequests || [])
                .find(
                    request =>
                        request.status === "pending"
                );


        if (pending) {

            showToast(
                "A friend request already exists.",
                "error"
            );

            return;
        }


        // Remove old declined request if one exists
        const declined =
            (existingRequests || [])
                .find(
                    request =>
                        request.status === "declined"
                );


        if (declined) {

            const { error: deleteError } =
                await supabaseClient
                    .from("friend_requests")
                    .delete()
                    .eq("id", declined.id);


            if (deleteError) {
                throw deleteError;
            }

        }


        const {
            error
        } = await supabaseClient
            .from("friend_requests")
            .insert({

                sender_id: user.id,
                receiver_id: receiverId,
                status: "pending"

            });


        if (error) {
            throw error;
        }


        showToast(
            "Friend request sent!"
        );


        await searchPeople(
            peopleSearchInput?.value.trim() || ""
        );


    } catch (error) {

        console.error(
            "Friend request error:",
            error
        );

        showToast(
            error.message ||
            "Unable to send friend request.",
            "error"
        );

    }

}


// ==========================================
// ACCEPT FRIEND REQUEST
// ==========================================

async function acceptFriendRequest(requestId) {

    try {

        const {
            error
        } = await supabaseClient.rpc(
            "accept_friend_request",
            {
                request_id: requestId
            }
        );


        if (error) {
            throw error;
        }


        showToast(
            "Friend request accepted!"
        );


        await searchPeople(
            peopleSearchInput?.value.trim() || ""
        );


        // These will be fully implemented next
        if (
            typeof loadFriends === "function"
        ) {
            await loadFriends();
        }

        if (
            typeof loadFriendRequests === "function"
        ) {
            await loadFriendRequests();
        }


    } catch (error) {

        console.error(
            "Accept request error:",
            error
        );

        showToast(
            error.message ||
            "Unable to accept friend request.",
            "error"
        );

    }

}

// ==========================================
// CHIRP - LOAD FRIEND REQUESTS
// ==========================================

async function loadFriendRequests() {

    const container =
        document.getElementById("friendRequestsList");

    if (!container) return;

    try {

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();

        if (!user) return;


        const {
            data: requests,
            error
        } = await supabaseClient
            .from("friend_requests")
            .select("*")
            .eq("receiver_id", user.id)
            .eq("status", "pending")
            .order("created_at", {
                ascending: false
            });


        if (error) throw error;


        if (!requests || requests.length === 0) {

            container.innerHTML = "";

            const empty =
                document.createElement("div");

            empty.className = "empty-state";

            const title =
                document.createElement("h3");

            title.textContent =
                "No friend requests";

            const text =
                document.createElement("p");

            text.textContent =
                "New friend requests will appear here.";

            empty.append(title, text);

            container.appendChild(empty);

            return;
        }


        // Get profiles of request senders

        const senderIds =
            requests.map(
                request => request.sender_id
            );


        const {
            data: profiles,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select(
                "id, name, username, avatar_url"
            )
            .in("id", senderIds);


        if (profileError) {
            throw profileError;
        }


        container.innerHTML = "";


        requests.forEach(request => {

            const profile =
                profiles?.find(
                    person =>
                        person.id === request.sender_id
                );

            if (!profile) return;


            const card =
                document.createElement("div");

            card.className =
                "person-card";


            const avatar =
                document.createElement("div");

            avatar.className =
                "user-avatar";

            avatar.textContent =
                profile.name
                    ?.charAt(0)
                    .toUpperCase() || "U";


            const information =
                document.createElement("div");

            information.className =
                "person-info";


            const name =
                document.createElement("strong");

            name.textContent =
                profile.name;


            const username =
                document.createElement("span");

            username.textContent =
                `@${profile.username}`;


            information.append(
                name,
                username
            );


            const actions =
                document.createElement("div");

            actions.className =
                "friend-request-actions";


            const acceptButton =
                document.createElement("button");

            acceptButton.className =
                "friend-action-btn";

            acceptButton.textContent =
                "Accept";


            acceptButton.addEventListener(
                "click",
                async () => {

                    await acceptFriendRequest(
                        request.id
                    );

                }
            );


            const declineButton =
                document.createElement("button");

            declineButton.className =
                "friend-action-btn secondary";

            declineButton.textContent =
                "Decline";


            declineButton.addEventListener(
                "click",
                async () => {

                    await declineFriendRequest(
                        request.id
                    );

                }
            );


            actions.append(
                acceptButton,
                declineButton
            );


            card.append(
                avatar,
                information,
                actions
            );


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Friend requests error:",
            error
        );

        showToast(
            "Unable to load friend requests.",
            "error"
        );

    }

}


// ==========================================
// DECLINE FRIEND REQUEST
// ==========================================

async function declineFriendRequest(requestId) {

    try {

        const {
            error
        } = await supabaseClient
            .from("friend_requests")
            .update({
                status: "declined"
            })
            .eq("id", requestId);


        if (error) throw error;


        showToast(
            "Friend request declined."
        );


        await loadFriendRequests();

        await searchPeople(
            peopleSearchInput?.value.trim() || ""
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Unable to decline request.",
            "error"
        );

    }

}


// ==========================================
// LOAD FRIENDS
// ==========================================

async function loadFriends() {

    const container =
        document.getElementById("friendsList");

    if (!container) return;


    try {

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();

        if (!user) return;


        const {
            data: friendships,
            error
        } = await supabaseClient
            .from("friendships")
            .select("friend_id")
            .eq("user_id", user.id);


        if (error) throw error;


        if (
            !friendships ||
            friendships.length === 0
        ) {

            container.innerHTML = "";

            const empty =
                document.createElement("div");

            empty.className =
                "empty-state";


            const title =
                document.createElement("h3");

            title.textContent =
                "No friends yet";


            const text =
                document.createElement("p");

            text.textContent =
                "Find people on Chirp and send a friend request.";


            empty.append(
                title,
                text
            );

            container.appendChild(empty);

            return;
        }


        const friendIds =
            friendships.map(
                friendship =>
                    friendship.friend_id
            );


        const {
            data: profiles,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select(
                "id, name, username, bio, avatar_url"
            )
            .in("id", friendIds);


        if (profileError) {
            throw profileError;
        }


        container.innerHTML = "";


        profiles.forEach(profile => {

            const card =
                document.createElement("div");

            card.className =
                "person-card";


            const avatar =
                document.createElement("div");

            avatar.className =
                "user-avatar";

            avatar.textContent =
                profile.name
                    ?.charAt(0)
                    .toUpperCase() || "U";


            const information =
                document.createElement("div");

            information.className =
                "person-info";


            const name =
                document.createElement("strong");

            name.textContent =
                profile.name;


            const username =
                document.createElement("span");

            username.textContent =
                `@${profile.username}`;


            information.append(
                name,
                username
            );


            const actions =
                document.createElement("div");

            actions.className =
                "friend-request-actions";


            // MESSAGE BUTTON

            const messageButton =
                document.createElement("button");

            messageButton.className =
                "friend-action-btn";

            messageButton.textContent =
                "Message";


            messageButton.addEventListener(
                "click",
                () => {

                    openConversation(profile);

                }
            );


            // REMOVE BUTTON

            const removeButton =
                document.createElement("button");

            removeButton.className =
                "friend-action-btn secondary";

            removeButton.textContent =
                "Remove";


            removeButton.addEventListener(
                "click",
                async () => {

                    const confirmed =
                        confirm(
                            `Remove ${profile.name} from your friends?`
                        );

                    if (!confirmed) {
                        return;
                    }


                    await removeFriend(
                        profile.id
                    );

                }
            );


            actions.append(
                messageButton,
                removeButton
            );


            card.append(
                avatar,
                information,
                actions
            );


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Friends error:",
            error
        );

        showToast(
            "Unable to load friends.",
            "error"
        );

    }

}


// ==========================================
// REMOVE FRIEND
// ==========================================

async function removeFriend(friendId) {

    try {

        const {
            error
        } = await supabaseClient.rpc(
            "remove_friend",
            {
                other_user_id: friendId
            }
        );


        if (error) {
            throw error;
        }


        showToast(
            "Friend removed."
        );


        await loadFriends();
        await loadProfileStats();

        await searchPeople(
            peopleSearchInput?.value.trim() || ""
        );


    } catch (error) {

        console.error(
            "Remove friend error:",
            error
        );

        showToast(
            "Unable to remove friend.",
            "error"
        );

    }

}


// ==========================================
// FRIEND PAGE TABS
// ==========================================

const friendTabButtons =
    document.querySelectorAll(
        "[data-friend-tab]"
    );


friendTabButtons.forEach(button => {

    button.addEventListener(
        "click",
        async () => {

            const selectedTab =
                button.dataset.friendTab;


            friendTabButtons.forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );


            button.classList.add(
                "active"
            );


            const friendsSection =
                document.getElementById(
                    "friendsTab"
                );

            const requestsSection =
                document.getElementById(
                    "requestsTab"
                );


            if (
                selectedTab === "requests"
            ) {

                friendsSection?.classList.add(
                    "hidden"
                );

                requestsSection?.classList.remove(
                    "hidden"
                );

                await loadFriendRequests();

            } else {

                requestsSection?.classList.add(
                    "hidden"
                );

                friendsSection?.classList.remove(
                    "hidden"
                );

                await loadFriends();

            }

        }
    );

});
// ==========================================
// CHIRP - PRIVATE MESSAGING
// ==========================================

let activeChatFriend = null;
let messageRealtimeChannel = null;


// ==========================================
// OPEN A CONVERSATION
// ==========================================

async function openConversation(profile) {

    activeChatFriend = profile;

    openPage("messagesPage");

    const chatName =
        document.getElementById("chatName");

    const chatUsername =
        document.getElementById("chatUsername");

    const chatAvatar =
        document.getElementById("chatAvatar");


    if (chatName) {
        chatName.textContent = profile.name;
    }

    if (chatUsername) {
        chatUsername.textContent =
            `@${profile.username}`;
    }

    if (chatAvatar) {
        chatAvatar.textContent =
            profile.name
                ?.charAt(0)
                .toUpperCase() || "U";
    }


    await loadMessages();

    await markMessagesAsRead();

    subscribeToMessages();

}


// ==========================================
// LOAD MESSAGES
// ==========================================

async function loadMessages() {

    if (!activeChatFriend) {
        return;
    }


    const container =
        document.getElementById("chatMessages");


    if (!container) {
        return;
    }


    try {

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();


        if (!user) {
            return;
        }


        const {
            data: messages,
            error
        } = await supabaseClient
            .from("messages")
            .select("*")
            .or(
                `and(sender_id.eq.${user.id},receiver_id.eq.${activeChatFriend.id}),and(sender_id.eq.${activeChatFriend.id},receiver_id.eq.${user.id})`
            )
            .order(
                "created_at",
                { ascending: true }
            );


        if (error) {
            throw error;
        }


        container.innerHTML = "";


        if (
            !messages ||
            messages.length === 0
        ) {

            const empty =
                document.createElement("div");

            empty.className =
                "empty-chat";


            const text =
                document.createElement("p");

            text.textContent =
                `Start your conversation with ${activeChatFriend.name}.`;


            empty.appendChild(text);

            container.appendChild(empty);

            return;
        }


        messages.forEach(message => {

            const messageElement =
                createMessageElement(
                    message,
                    user.id
                );


            container.appendChild(
                messageElement
            );

        });


        scrollChatToBottom();


    } catch (error) {

        console.error(
            "Load messages error:",
            error
        );


        showToast(
            "Unable to load messages.",
            "error"
        );

    }

}


// ==========================================
// CREATE MESSAGE ELEMENT
// ==========================================

function createMessageElement(
    message,
    currentUserId
) {

    const wrapper =
        document.createElement("div");


    const isMine =
        message.sender_id ===
        currentUserId;


    wrapper.className =
        isMine
            ? "message-row sent"
            : "message-row received";


    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";


    const text =
        document.createElement("p");

    // Prevent user messages becoming HTML
    text.textContent =
        message.message;


    const time =
        document.createElement("span");

    time.className =
        "message-time";


    time.textContent =
        new Date(
            message.created_at
        ).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    bubble.append(
        text,
        time
    );


    wrapper.appendChild(
        bubble
    );


    return wrapper;

}


// ==========================================
// SEND MESSAGE
// ==========================================

const messageForm =
    document.getElementById("messageForm");

const messageInput =
    document.getElementById("messageInput");


if (messageForm) {

    messageForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!activeChatFriend) {

                showToast(
                    "Choose a friend first.",
                    "error"
                );

                return;
            }


            const message =
                messageInput.value.trim();


            if (!message) {
                return;
            }


            if (message.length > 2000) {

                showToast(
                    "Message is too long.",
                    "error"
                );

                return;
            }


            try {

                const {
                    data: { user }
                } =
                    await supabaseClient.auth
                        .getUser();


                if (!user) {

                    throw new Error(
                        "You must be signed in."
                    );

                }


                const {
                    error
                } =
                    await supabaseClient
                        .from("messages")
                        .insert({

                            sender_id:
                                user.id,

                            receiver_id:
                                activeChatFriend.id,

                            message:
                                message

                        });


                if (error) {
                    throw error;
                }


                messageInput.value = "";


                // Reload immediately.
                // Realtime will handle messages
                // coming from the other user.
                await loadMessages();

                await loadConversations();


            } catch (error) {

                console.error(
                    "Send message error:",
                    error
                );


                showToast(
                    error.message ||
                    "Unable to send message.",
                    "error"
                );

            }

        }
    );

}


// ==========================================
// REALTIME MESSAGES
// ==========================================

function subscribeToMessages() {

    // Remove previous subscription
    if (messageRealtimeChannel) {

        supabaseClient.removeChannel(
            messageRealtimeChannel
        );

    }


    messageRealtimeChannel =
        supabaseClient
            .channel(
                `chirp-messages-${Date.now()}`
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages"
                },

                async payload => {

                    const newMessage =
                        payload.new;


                    const {
                        data: { user }
                    } =
                        await supabaseClient.auth
                            .getUser();


                    if (
                        !user ||
                        !activeChatFriend
                    ) {
                        return;
                    }


                    const belongsToChat =
                        (
                            newMessage.sender_id ===
                                user.id &&
                            newMessage.receiver_id ===
                                activeChatFriend.id
                        )
                        ||
                        (
                            newMessage.sender_id ===
                                activeChatFriend.id &&
                            newMessage.receiver_id ===
                                user.id
                        );


                    if (!belongsToChat) {
                        return;
                    }


                    await loadMessages();


                    if (
                        newMessage.receiver_id ===
                        user.id
                    ) {

                        await markMessagesAsRead();

                    }


                    await loadConversations();

                }
            )
            .subscribe();

}


// ==========================================
// MARK RECEIVED MESSAGES AS READ
// ==========================================

async function markMessagesAsRead() {

    if (!activeChatFriend) {
        return;
    }


    try {

        const {
            data: { user }
        } =
            await supabaseClient.auth
                .getUser();


        if (!user) {
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
                    "receiver_id",
                    user.id
                )
                .eq(
                    "sender_id",
                    activeChatFriend.id
                )
                .eq(
                    "read",
                    false
                );


        if (error) {
            throw error;
        }


    } catch (error) {

        console.error(
            "Read status error:",
            error
        );

    }

}


// ==========================================
// SCROLL CHAT TO NEWEST MESSAGE
// ==========================================

function scrollChatToBottom() {

    const container =
        document.getElementById(
            "chatMessages"
        );


    if (!container) {
        return;
    }


    container.scrollTop =
        container.scrollHeight;

}


// ==========================================
// LOAD CONVERSATIONS
// ==========================================

async function loadConversations() {

    const container =
        document.getElementById(
            "conversationsList"
        );


    if (!container) {
        return;
    }


    try {

        const {
            data: { user }
        } =
            await supabaseClient.auth
                .getUser();


        if (!user) {
            return;
        }


        // Get friends
        const {
            data: friendships,
            error: friendshipError
        } =
            await supabaseClient
                .from("friendships")
                .select("friend_id")
                .eq(
                    "user_id",
                    user.id
                );


        if (friendshipError) {
            throw friendshipError;
        }


        if (
            !friendships ||
            friendships.length === 0
        ) {

            container.innerHTML = "";

            const empty =
                document.createElement("div");

            empty.className =
                "empty-state";


            const text =
                document.createElement("p");

            text.textContent =
                "Add friends to start chatting.";


            empty.appendChild(text);

            container.appendChild(empty);

            return;
        }


        const friendIds =
            friendships.map(
                item => item.friend_id
            );


        // Get friend profiles
        const {
            data: profiles,
            error: profileError
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "id, name, username, avatar_url"
                )
                .in(
                    "id",
                    friendIds
                );


        if (profileError) {
            throw profileError;
        }


        // Get all messages involving current user
        const {
            data: messages,
            error: messageError
        } =
            await supabaseClient
                .from("messages")
                .select("*")
                .or(
                    `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (messageError) {
            throw messageError;
        }


        container.innerHTML = "";


        profiles.forEach(profile => {

            const latestMessage =
                (messages || []).find(
                    message =>
                        (
                            message.sender_id ===
                                user.id &&
                            message.receiver_id ===
                                profile.id
                        )
                        ||
                        (
                            message.sender_id ===
                                profile.id &&
                            message.receiver_id ===
                                user.id
                        )
                );


            const unreadCount =
                (messages || []).filter(
                    message =>
                        message.sender_id ===
                            profile.id &&
                        message.receiver_id ===
                            user.id &&
                        message.read === false
                ).length;


            const item =
                document.createElement(
                    "button"
                );

            item.className =
                "conversation-item";


            const avatar =
                document.createElement(
                    "div"
                );

            avatar.className =
                "user-avatar";

            avatar.textContent =
                profile.name
                    ?.charAt(0)
                    .toUpperCase() || "U";


            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "conversation-info";


            const name =
                document.createElement(
                    "strong"
                );

            name.textContent =
                profile.name;


            const preview =
                document.createElement(
                    "span"
                );


            if (latestMessage) {

                preview.textContent =
                    latestMessage.message
                        .length > 35
                        ? latestMessage.message
                            .slice(0, 35) + "…"
                        : latestMessage.message;

            } else {

                preview.textContent =
                    `@${profile.username}`;

            }


            info.append(
                name,
                preview
            );


            item.append(
                avatar,
                info
            );


            if (unreadCount > 0) {

                const badge =
                    document.createElement(
                        "span"
                    );

                badge.className =
                    "unread-badge";

                badge.textContent =
                    unreadCount > 99
                        ? "99+"
                        : unreadCount;


                item.appendChild(
                    badge
                );

            }


            item.addEventListener(
                "click",
                async () => {

                    await openConversation(
                        profile
                    );

                }
            );


            container.appendChild(
                item
            );

        });


    } catch (error) {

        console.error(
            "Conversation error:",
            error
        );

    }

}