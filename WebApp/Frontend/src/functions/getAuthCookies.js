import Cookies from 'js-cookie';

function getAuthCookies(){
    setTimeout(() => {
        const userAuthDataString = Cookies.get('_auth_state');
        const {username, deviceId} = JSON.parse(userAuthDataString)
    
        return {username, deviceId};
    }, 250);
}

export default getAuthCookies;