    import React from 'react'

    const LocationSearchPanel = (props) => {
      const suggestions = Array.isArray(props.suggestions)
        ? props.suggestions
        : props.suggestions?.suggestions || []

      return (
        <div>
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                // Directly call the setter based on which one exists
              if(props.ispickupActive){
                props.setPickup(item.address)
                props.setIspickupActive(false)
              }
              else{
                props.setDestination(item.address)
                props.setIspickupActive(true)
              }
              }}
              className="flex gap-4 border-2 p-3 border-gray-50 rounded-xl items-center my-2 justify-start cursor-pointer hover:bg-gray-50 transition-all"
            >
              <h2 className="bg-[#eee] h-8 flex items-center justify-center w-12 rounded-full">
                <i className="ri-map-pin-fill"></i>
              </h2>
              <h4 className="font-medium">{item.address}</h4>
            </div>
          ))}
        </div>
      )
    }

    export default LocationSearchPanel
