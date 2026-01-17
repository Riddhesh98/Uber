import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
console.log("UserLogout page loaded");
export const UserLogout = () => {

    const token = localStorage.getItem('token')
    const navigate = useNavigate()

    axios.get(`${import.meta.env.VITE_API_URL}/users/logout`,
        { withCredentials: true }
    )
    .then((response) => {
        if (response.status === 200) {
            localStorage.removeItem('token')
            navigate('/login')
           
        }
    })

    return (
        <div>UserLogout</div>
    )
}

export default UserLogout