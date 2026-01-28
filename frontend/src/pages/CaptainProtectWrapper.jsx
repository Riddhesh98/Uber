// import React, { useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'


// const CaptainProtectWrapper = ({children}) => {

//     const Cap_token= localStorage.getItem('Cap-token')

//     const navigate = useNavigate()

//     useEffect(() => {
//     if (!Cap_token || Cap_token === 'undefined') {
//       console.log('No captain token found, redirecting to captain login')
//         navigate('/captain-login')
//     }} ,[ Cap_token ])

//   return (
//   <>
//     {children}
//   </>
//   )
// }

// export default CaptainProtectWrapper

import { useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from '../context/CaptainContext' // adjust path if needed

const CaptainProtectWrapper = ({ children }) => {
  const navigate = useNavigate()
  const { captain, setCaptain } = useContext(CaptainDataContext)

  useEffect(() => {
    const token = localStorage.getItem('Cap-token')

    // ❌ No token → go to captain login
    if (!token || token === 'undefined') {
      navigate('/captain-login') // keep your URL
      return
    }

    // ✅ Captain already in context → allow page
    if (captain) return

    const getCaptainProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/captains/profile-Captain`, 
          // 👆 leave URL here if different
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        setCaptain(res.data.data) // adjust if backend structure differs
      } catch (error) {
        // ❌ Token invalid / expired
        localStorage.removeItem('Cap-token')
        navigate('/captain-login')
      }
    }

    getCaptainProfile()
  }, [navigate, captain, setCaptain])

  return children
}

export default CaptainProtectWrapper
