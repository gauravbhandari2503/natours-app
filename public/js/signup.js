import axios from 'axios';

export const signup = async(userInfo) => {
    try {
        const res = await axios.post('/api/v1/users/signup', userInfo);
        if (res.data.status === 'success') {
            window.setTimeout(() => {
                location.assign('/');
            }, 1500)
        }
    } catch (err) {
        console.log(err)
    }
};

