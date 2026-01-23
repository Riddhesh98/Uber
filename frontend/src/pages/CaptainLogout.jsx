
import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export const CaptainLogout = () => {

    const navigate = useNavigate()

    axios.get(`${import.meta.env.VITE_API_URL}/api/v1/captains/logout-Captain,`)
    .then((response) => {
        if (response.status === 200) {
            localStorage.removeItem('Cap-token')
            navigate('/captain-login')
        }
    })

    return (
        <div>CaptainLogout</div>
    )
}

export default CaptainLogout