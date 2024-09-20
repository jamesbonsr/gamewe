// Estructura de datos en memoria
let users = JSON.parse(sessionStorage.getItem('users')) || {};
let tweets = JSON.parse(sessionStorage.getItem('tweets')) || [];
let currentUser = sessionStorage.getItem('currentUser') || null;

// Mostrar vista de inicio de sesión
function showLogin() {
    document.getElementById('login-view').style.display = 'block';
    document.getElementById('register-view').style.display = 'none';
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('edit-profile-view').style.display = 'none';
}

// Mostrar vista de registro
function showRegister() {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('register-view').style.display = 'block';
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('edit-profile-view').style.display = 'none';
}

// Mostrar la aplicación después de iniciar sesión
function showApp() {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('register-view').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('edit-profile-view').style.display = 'none';
    renderTweets();
}

// Mostrar perfil de usuario
function showProfile(username) {
    const user = Object.values(users).find(user => user.username === username);
    if (user) {
        document.getElementById('profile-username').textContent = username;
        document.getElementById('profile-bio').textContent = user.bio || 'No hay biografía disponible';
        document.getElementById('profile-game-id').textContent = user.gameId || 'No hay ID de juego disponible';
        document.getElementById('profile-view').style.display = 'block';
    } else {
        alert('No se puede encontrar el perfil del usuario.');
    }
}

// Ocultar perfil de usuario
function hideProfile() {
    document.getElementById('profile-view').style.display = 'none';
}

// Mostrar formulario de edición de perfil
function showEditProfile() {
    if (currentUser && users[Object.keys(users).find(email => users[email].username === currentUser)]) {
        const email = Object.keys(users).find(email => users[email].username === currentUser);
        const user = users[email];

        document.getElementById('edit-username').value = user.username;
        document.getElementById('edit-bio').value = user.bio || '';
        document.getElementById('edit-game-id').value = user.gameId || '';

        document.getElementById('edit-profile-view').style.display = 'block';
    } else {
        alert('No se puede encontrar el usuario actual. Por favor, inicia sesión de nuevo.');
        logout();
    }
}

// Ocultar la vista de edición de perfil
function hideEditProfile() {
    document.getElementById('edit-profile-view').style.display = 'none';
}

// Actualizar perfil del usuario
function updateProfile() {
    const newUsername = document.getElementById('edit-username').value;
    const newBio = document.getElementById('edit-bio').value;
    const newGameId = document.getElementById('edit-game-id').value;

    const email = Object.keys(users).find(email => users[email].username === currentUser);

    if (email && users[email]) {
        users[email].username = newUsername;
        users[email].bio = newBio;
        users[email].gameId = newGameId;

        sessionStorage.setItem('users', JSON.stringify(users));
        sessionStorage.setItem('currentUser', newUsername); // Actualizamos el nombre de usuario en sessionStorage

        currentUser = newUsername; // Actualizamos la referencia a currentUser con el nuevo nombre

        hideEditProfile();
        showApp();
        renderTweets();
    } else {
        alert('Error al actualizar el perfil. Asegúrate de haber iniciado sesión correctamente.');
    }
}

// Iniciar sesión
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (users[email] && users[email].password === password) {
        alert('Inicio de sesión exitoso');
        currentUser = users[email].username;
        sessionStorage.setItem('currentUser', currentUser);
        showApp();
    } else {
        alert('Correo electrónico o contraseña incorrectos');
    }
}

// Registrarse
function register() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (!users[email]) {
        const username = email.split('@')[0];
        users[email] = { password, username, bio: '', gameId: '' }; // Añadir bio e ID de juego vacíos
        sessionStorage.setItem('users', JSON.stringify(users));
        alert('Registro exitoso');
        showLogin();
    } else {
        alert('El correo electrónico ya está registrado');
    }
}

// Renderizar tweets
function renderTweets() {
    const tweetFeed = document.getElementById('tweet-feed');
    tweetFeed.innerHTML = '';
    tweets.forEach((tweet, index) => {
        const tweetDiv = document.createElement('div');
        tweetDiv.classList.add('tweet');

        const replies = tweet.replies ? tweet.replies.map(reply => `<p><strong>${reply.username}:</strong> ${reply.text}</p>`).join('') : '';

        tweetDiv.innerHTML = `
            <p><strong><a href="#" onclick="showProfile('${tweet.username}'); return false;">${tweet.username}</a>:</strong> ${tweet.text}</p>
            <div class="actions">
                <button onclick="likeTweet(${index})">${tweet.likes || 0} Like</button>
                <button onclick="retweetTweet(${index})">${tweet.retweets || 0} Retweet</button>
                <button onclick="replyTweet(${index})">Reply</button>
            </div>
            <div class="replies">
                ${replies}
            </div>
        `;
        tweetFeed.appendChild(tweetDiv);
    });
}

// Publicar un tweet
function postTweet() {
    const tweetText = document.getElementById('tweet-text').value;
    if (!tweetText) {
        alert('No puedes publicar un tweet vacío');
        return;
    }

    if (currentUser) {
        tweets.push({ text: tweetText, username: currentUser, likes: 0, retweets: 0, replies: [] });
        sessionStorage.setItem('tweets', JSON.stringify(tweets));
        document.getElementById('tweet-text').value = '';
        renderTweets();
    } else {
        alert('Debes iniciar sesión para publicar un tweet.');
    }
}

// Dar like a un tweet
function likeTweet(index) {
    if (index >= 0 && index < tweets.length) {
        tweets[index].likes = (tweets[index].likes || 0) + 1;
        sessionStorage.setItem('tweets', JSON.stringify(tweets));
        renderTweets();
    }
}

// Retweetear un tweet
function retweetTweet(index) {
    if (index >= 0 && index < tweets.length) {
        tweets[index].retweets = (tweets[index].retweets || 0) + 1;
        sessionStorage.setItem('tweets', JSON.stringify(tweets));
        renderTweets();
    }
}

// Responder a un tweet
function replyTweet(index) {
    const replyText = prompt('Escribe tu respuesta:');
    if (replyText) {
        if (!tweets[index].replies) {
            tweets[index].replies = [];
        }
        tweets[index].replies.push({ text: replyText, username: currentUser });
        sessionStorage.setItem('tweets', JSON.stringify(tweets));
        renderTweets();
    }
}

// Cerrar sesión
function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('tweets');
    sessionStorage.removeItem('users');
    showLogin();
}

// Inicializar vista
if (currentUser) {
    showApp();
} else {
    showLogin();
}

// Manejar el evento de salir de la página
window.addEventListener('beforeunload', () => {
    if (currentUser) {
        sessionStorage.setItem('users', JSON.stringify(users));
        sessionStorage.setItem('tweets', JSON.stringify(tweets));
    }
});
