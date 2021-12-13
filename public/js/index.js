import '@babel/polyfill';
import { login, logout } from './login';
import { updateData, updatePassword } from './updateSettings';
import { signup } from './signup';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';

// Dom Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.login');
const signupForm = document.querySelector('.signup-form');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateUserData = document.querySelector('.form-user-data');
const updateUserPassword = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');

// Values



// Delegation
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
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

if (updateUserData) {
    updateUserData.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateData(form);
    })
}

if (updateUserPassword) {
    updateUserPassword.addEventListener('submit', e => {
        e.preventDefault();

        const currentPassword = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const newPasswordConfirm = document.getElementById('password-confirm').value;

        const userData = {
            currentPassword, newPassword, newPasswordConfirm
        };

        updatePassword(userData);

    })
}

if (bookBtn) {
    bookBtn.addEventListener('click', e => {
        debugger;
        e.target.textContent = 'Processing...';
        const {tourId} = e.target.dataset;
        bookTour(tourId);

    })
}