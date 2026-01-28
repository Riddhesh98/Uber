    import React, { useEffect, useRef, useState } from 'react'
    import { useGSAP } from '@gsap/react';
    import gsap from 'gsap';
    import 'remixicon/fonts/remixicon.css'
    import LocationSearchPanel from '../components/LocationSearchPanel';
    import VehiclePanel from '../components/VehiclePanel';
    import ConfirmRide from '../components/ConfirmRide';
    import LookingForDriver from '../components/LookingForDriver';
    import WaitingForDriver from '../components/WaitingForDriver';
    import axios from 'axios';
    import { SocketContext } from '../context/SocketContext';
    import {UserDataContext} from "../context/UserContext"


    const Home = () => {
        const [pickup, setPickup] = useState('')
        const [destination, setDestination] = useState('')
        const [panelOpen, setPanelOpen] = useState(false)
        const vehiclePanelRef = useRef(null)
        const confirmRidePanelRef = useRef(null)
        const vehicleFoundRef = useRef(null)
        const waitingForDriverRef = useRef(null)


        const panelRef = useRef(null)
        const panelCloseRef = useRef(null)
        const [vehiclePanel, setVehiclePanel] = useState(false)
        const [confirmRidePanel, setConfirmRidePanel] = useState(false)
        
        const [vehicleFound, setVehicleFound] = useState(false)
        const [waitingForDriver, setWaitingForDriver] = useState(false)

            //my
            const [suggestions, setSuggestions] = useState([]);
            const [fareData, setFareData] = useState(null)
             const [ispickupActive, setIspickupActive] = useState(true)
            const [vehicleSelect, setvehicleSelect] = useState(null)

            const {sendMessage , receiveMessage} = React.useContext(SocketContext);
            const {user} = React.useContext(UserDataContext);

            useEffect(() =>{
                if(!user) return;

                sendMessage("join" , {
                    userType:"user",
                    userId:user.user?._id   
                })
                console.log(user)
                console.log("User joined socket with ID:", user.user?._id);

              

            },[user])



        const submitHandler = (e) => {
            e.preventDefault()
        }

        useGSAP(function () {
            if (panelOpen) {
                gsap.to(panelRef.current, {
                    height: '70%',
                    padding: 24
                    // opacity:1
                })
                gsap.to(panelCloseRef.current, {
                    opacity: 1
                })
            } else {
                gsap.to(panelRef.current, {
                    height: '0%',
                    padding: 0
                    // opacity:0
                })
                gsap.to(panelCloseRef.current, {
                    opacity: 0
                })
            }
        }, [panelOpen])


        useGSAP(function () {
            if (vehiclePanel) {
                gsap.to(vehiclePanelRef.current, {
                    transform: 'translateY(0)'
                })
            } else {
                gsap.to(vehiclePanelRef.current, {
                    transform: 'translateY(100%)'
                })
            }
        }, [vehiclePanel])

        useGSAP(function () {
            if (confirmRidePanel) {
                gsap.to(confirmRidePanelRef.current, {
                    transform: 'translateY(0)'
                })
            } else {
                gsap.to(confirmRidePanelRef.current, {
                    transform: 'translateY(100%)'
                })
            }
        }, [confirmRidePanel])

        useGSAP(function () {
            if (vehicleFound) {
                gsap.to(vehicleFoundRef.current, {
                    transform: 'translateY(0)'
                })
            } else {
                gsap.to(vehicleFoundRef.current, {
                    transform: 'translateY(100%)'
                })
            }
        }, [vehicleFound])

        useGSAP(function () {
            if (waitingForDriver) {
                gsap.to(waitingForDriverRef.current, {
                    transform: 'translateY(0)'
                })
            } else {
                gsap.to(waitingForDriverRef.current, {
                    transform: 'translateY(100%)'
                })
            }
        }, [waitingForDriver])

        const suggestionsFnc = async (value) => {
            if (!value) return;   // if input is empty, do nothing
          
            try {
              const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/api/maps/address-suggestions`,
                {
                  params: { text: value }   // send typed text
                }
              );
              
              setSuggestions(res.data);  // save suggestions
            
            } catch (error) {
              console.log(error);
            }
          };
          

          const getFare = async () => {   
            try {
              const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/api/maps/fare`,
               {
                params: { pickup, destination }
               }
              );
              
              return res.data;  // save suggestions
            
            } catch (error) {
              console.log(error);
            } 
          }


          const createRide = async () => {
            try {
                const token = localStorage.getItem("Cap-token");
                if (!token) {
                    throw new Error("User not authenticated");
                }
        
                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}/api/v1/rides/create-ride`,
                    {
                        pickup,
                        destination,
                        vehicleType: vehicleSelect,
                    },
                    { withCredentials: true } // ✅ send cookies
                );
        
                console.log("Ride created:", response.data);
                return response.data;
        
            } catch (error) {
                console.error("Failed to create ride:", error.response?.data || error.message);
                alert(error.response?.data?.message || error.message);
            }
        };
        

        return (
        

            <div className='h-screen relative overflow-hidden'>
                <img className='w-16 absolute left-5 top-5' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
                <div className='h-screen w-screen'>
                    {/* image for temporary use  */}
                    <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />
                </div>
                <div className=' flex flex-col justify-end h-screen absolute top-0 w-full'>
                    <div className='h-[30%] p-6 bg-white relative'>
                        <h5 ref={panelCloseRef} onClick={() => {
                            setPanelOpen(false)
                        }} className='absolute opacity-0 right-6 top-6 text-2xl'>
                            <i className="ri-arrow-down-wide-line"></i>
                        </h5>
                        <h4 className='text-2xl font-semibold'>Find a trip</h4>
                        <form onSubmit={(e) => {
                            submitHandler(e)
                        }}>
                            <div className="line absolute h-16 w-1 top-[45%] left-10 bg-gray-700 rounded-full"></div>
                            <input
                                onClick={() => {
                                    setPanelOpen(true)
                                }}
                                value={pickup}
                                onChange={(e) => {
                                    setPickup(e.target.value)
                                    suggestionsFnc(e.target.value);
                                }}
                                className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-5'
                                type="text"
                                placeholder='Add a pick-up location'
                            />
                            <input
                                onClick={() => {
                                    setPanelOpen(true)
                                }}
                                value={destination}
                                onChange={(e) => {
                                    setDestination(e.target.value)
                                    suggestionsFnc(e.target.value);
                                }}
                                className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full  mt-3'
                                type="text"
                                placeholder='Enter your destination' />

<button 
    onClick={async () => {
        // 1. Get the data first
        const res = await getFare();
        if (res) {
            setFareData(res.fare);
            
            // 2. ONLY THEN trigger the panels
            setVehiclePanel(true);
            setPanelOpen(false);
        }
    }}
className='w-full bg-black text-white text-2xl font-semibold py-3 mt-3 rounded-full cursor-pointer hover:bg-gray-600 transition-colors flex items-center justify-center'>
  Finish
</button>
                        </form>
                    </div>
                    <div ref={panelRef} className='bg-white h-0'>
                        <LocationSearchPanel setPanelOpen={setPanelOpen} setVehiclePanel={setVehiclePanel} 
                             suggestions={suggestions}  setPickup={setPickup} setDestination={setDestination}
                                ispickupActive={ispickupActive} setIspickupActive={setIspickupActive}
                        />
                    </div>
                </div>
                <div ref={vehiclePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                    <VehiclePanel
                    vehicleSelect={vehicleSelect} setvehicleSelect={setvehicleSelect}
                     fare={fareData}
                    setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} />
                </div>
                <div ref={confirmRidePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                    <ConfirmRide setConfirmRidePanel={setConfirmRidePanel} setVehicleFound={setVehicleFound}
                        pickup={pickup} destination={destination} vehicleSelect={vehicleSelect} fare={fareData}
                            createRide={createRide}
                        />
                </div>
                <div ref={vehicleFoundRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                    <LookingForDriver setVehicleFound={setVehicleFound } 
                        pickup={pickup} destination={destination} vehicleSelect={vehicleSelect} fare={fareData}
                    />
                </div>
                <div ref={waitingForDriverRef} className='fixed w-full z-10 bottom-0  bg-white px-3 py-6 pt-12'>
                    <WaitingForDriver  waitingForDriver={waitingForDriver} />
                </div>
            </div>
        )
    }

    export default Home