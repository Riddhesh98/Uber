import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'


const CaptainProtectWrapper = ({children}) => {

    const Cap_token= localStorage.getItem('Cap-token')

    const navigate = useNavigate()

    useEffect(() => {
    if (!Cap_token || Cap_token === 'undefined') {
      console.log('No captain token found, redirecting to captain login')
        navigate('/captain-login')
    }} ,[ Cap_token ])

  return (
  <>
    {children}
  </>
  )
}

export default CaptainProtectWrapper