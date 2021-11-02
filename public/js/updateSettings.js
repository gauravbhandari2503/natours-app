import axios from 'axios';
import { showAlert } from './alerts';

export const updateData = async(data) => {
    try {
        const res = await axios.patch('/api/v1/users/updateMe', data);
        showAlert('success', 'Data updated successfully!');
        if (res.data.status === 'success') {
            window.setTimeout(() => {
                location.assign('/me');
            }, 1500)
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const updatePassword = async(data) => {
    try {
        const res = await axios.patch('/api/v1/users/change-password', data);
        showAlert('success', 'Password Changed successfully!');
        if (res.data.status === 'success') {
            window.setTimeout(() => {
                location.assign('/me');
            }, 1500)
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}
