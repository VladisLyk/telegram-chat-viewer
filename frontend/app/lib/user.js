class UserStorage {
    static saveUserData(userData) {
        if (typeof userData === 'object') {
            localStorage.setItem('userData', JSON.stringify(userData));
        } else {
            console.error('User data must be an object');
        }
    }

    static getUserData() {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    }

    static updateUserField(field, value) {
        const userData = this.getUserData();
        if (userData && typeof userData === 'object') {
            userData[field] = value;
            this.saveUserData(userData);
        } else {
            console.error('No valid user data found to update');
        }
    }

    static clearUserData() {
        localStorage.removeItem('userData');
    }
}

export default UserStorage;
