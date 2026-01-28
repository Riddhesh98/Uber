import { useContext, useEffect, useState } from 'react'
import { UserDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const UserProtectWrapper = ({ children }) => {
  const { user, setUser } = useContext(UserDataContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    // ❌ no token → login
    if (!token) {
      navigate('/login')
      return
    }

    // ✅ user already loaded
    if (user) {
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        setUser(res.data.data)
        setLoading(false)
      } catch (error) {
        localStorage.removeItem('token')
        navigate('/login')
      }
    }

    fetchUser()
  }, [user, setUser, navigate])

  if (loading) {
    return <p className="text-center mt-10">⏳ Loading...</p>
  }

  return children
}

export default UserProtectWrapper
