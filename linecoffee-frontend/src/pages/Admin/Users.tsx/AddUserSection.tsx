import axios from 'axios';
import  { useState } from 'react';
import { getDecryptedToken } from '../../../utils/authUtils';

type AddUserSectionProps = {
    fetchUsers?: () => void;
};
function AddUserSection({ fetchUsers }: AddUserSectionProps) {
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        userName: '',
        userPhone: '',
        address: '',

    });

    const token = getDecryptedToken();


    const createNewUser = async () => {
        const backendURL = import.meta.env.VITE_BACKEND_URL;
        try {
            const { data } = await axios.post(
                `${backendURL}/users/createUserByAdmin`,
                newUser,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("New user added:", data);
            setNewUser({ email: '', password: '', userName: '', userPhone: '', address: '', });

            if (fetchUsers) fetchUsers(); // ✅ لو انتي بعتاها كـ prop
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.log("Error adding user:", err);
            console.log("Details:", err.response?.data);
            alert(err.response?.data?.errors?.[0] || err.response?.data?.message || "Failed to create user");
        }
    };

    return (
        <div className="mb-4">
            <h5>Create New User</h5>
            <div className="row">
                <div className="col">
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                </div>
                <div className="col">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Name"
                        value={newUser.userName}
                        onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                    />
                </div>
                <div className="col">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                </div>
                <div className="col">
                    <input
                        type="userPhone"
                        className="form-control"
                        placeholder="userPhone"
                        value={newUser.userPhone}
                        onChange={(e) => setNewUser({ ...newUser, userPhone: e.target.value })}
                    />
                </div>
                <div className="col">
                    <input
                        type="address"
                        className="form-control"
                        placeholder="address"
                        value={newUser.address}
                        onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                    />
                </div>
                <div className="col">
                    <button className="btn btn-success w-100" onClick={createNewUser}>Add</button>
                </div>
            </div>
        </div>
    );
}

export default AddUserSection;
