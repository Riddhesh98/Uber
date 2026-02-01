import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const ConfirmRidePopUp = (props) => {
  const [otp, setOtp] = useState('')
  const navigate = useNavigate()

  // 🔹 Confirm ride function
  const confirmRide = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/rides/start-ride`,
        {
          rideId: props.ride._id,
          otp: otp
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Cap-token")}`
          }
        }
      )

      if (res.data.success) {
        // Close popups
        props.setConfirmRidePopupPanel(false)
        props.setRidePopupPanel(false)

        // Navigate to riding page
        navigate('/captain-riding')
      }
    } catch (error) {
      console.error("Error starting ride:", error.response?.data || error.message)
      alert(error.response?.data?.message || "Something went wrong")
    }
  }

  // 🔹 Cancel function
  const cancelRide = () => {
    props.setConfirmRidePopupPanel(false)
    props.setRidePopupPanel(false)
  }

  return (
    <div>
      <h5
        className='p-1 text-center w-[93%] absolute top-0'
        onClick={cancelRide}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      <h3 className='text-2xl font-semibold mb-5'>
        Confirm this ride to Start
      </h3>

      <div className='flex items-center justify-between p-3 border-2 border-yellow-400 rounded-lg mt-4'>
        <div className='flex items-center gap-3'>
          <img
            className='h-12 rounded-full object-cover w-12'
            src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg"
            alt=""
          />
          <h2 className='text-lg font-medium'>
            {props?.ride?.user.firstName + " " + props?.ride?.user.lastName}
          </h2>
        </div>
        <h5 className='text-lg font-semibold'>2.2 KM</h5>
      </div>

      <div className='flex gap-2 justify-between flex-col items-center'>
        <div className='w-full mt-5'>
          <div className='flex items-center gap-5 p-3 border-b-2'>
            <i className="ri-map-pin-user-fill"></i>
            <div>
              <h3 className='text-lg font-medium'>{props.ride?.pickup}</h3>
            </div>
          </div>

          <div className='flex items-center gap-5 p-3 border-b-2'>
            <i className="text-lg ri-map-pin-2-fill"></i>
            <div>
              <h3 className='text-lg font-medium'>{props.ride?.destination}</h3>
            </div>
          </div>

          <div className='flex items-center gap-5 p-3'>
            <i className="ri-currency-line"></i>
            <div>
              <h3 className='text-lg font-medium'>₹193.20</h3>
              <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
            </div>
          </div>
        </div>

        <div className='mt-6 w-full'>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            type="text"
            className='bg-[#eee] px-6 py-4 font-mono text-lg rounded-lg w-full mt-3'
            placeholder='Enter OTP'
          />

          <button
            type="button"
            onClick={confirmRide}
            className='w-full mt-5 text-lg flex justify-center bg-green-600 text-white font-semibold p-3 rounded-lg'
          >
            Confirm
          </button>

          <button
            type="button"
            onClick={cancelRide}
            className='w-full mt-2 bg-red-600 text-lg text-white font-semibold p-3 rounded-lg'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmRidePopUp
