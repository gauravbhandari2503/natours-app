import axios from 'axios';
import { showAlert } from './alerts';

export const login = async(login) => {
    try {
        const res = await axios.post('/api/v1/users/login', login);
        showAlert('success', 'Logged in successfully!');
        if (res.data.status === 'success') {
            window.setTimeout(() => {
                location.assign('/');
            }, 1500)
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const logout = async () => {
    try {
        const res = await axios.get('/api/v1/users/logout');
        if (res.data.status === 'success') {
            window.setTimeout(() => {
                location.assign('/login');
            }, 1500)
        } 
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}