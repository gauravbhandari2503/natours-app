import '@babel/polyfill';
import { login, logout } from './login';
import { signup } from './signup';
import { displayMap } from './mapbox';

// Dom Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const signupForm = document.querySelector('.signup-form');
const logOutBtn = document.querySelector('.nav__el--logout');
// Values



// Delegation
if (mapBox) {
    const locations = JSON.parse.mapBox.dataset.locations;
    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginDetails = {
            email,
            password
        }
        login(loginDetails);
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const role = document.getElementById('role').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
    
        const userInfo = {
            name,
            email,
            role,
            password,
            passwordConfirm
        }
        signup(userInfo);
    });
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', logout);
}