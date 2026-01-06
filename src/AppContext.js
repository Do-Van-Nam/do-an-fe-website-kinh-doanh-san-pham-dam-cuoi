import React, { createContext,useState,useEffect} from "react";

export const AppContext = createContext()

const AppProvider = ({children})=>{
    const [acc,setAcc] = useState(() => {
        return JSON.parse(localStorage.getItem("acc")) || null;
      })
    const [buildings,setBuildings] = useState([])
    const [floor,setFloor] = useState([])
    const [rooms,setRooms] = useState([])
    const [selectedBuilding,setSelectedBuilding] = useState({})
    const [plan,setPlan] = useState({})
    useEffect(() => {
        if (acc) {
          localStorage.setItem("acc", JSON.stringify(acc));
        } else {
          localStorage.removeItem("acc");
        }
      }, [acc]);

    return (
        <AppContext.Provider 
        value={{acc,setAcc,buildings,setBuildings,selectedBuilding,setSelectedBuilding,
            rooms,setRooms, floor,setFloor,plan,setPlan
        }}
        >
            {children}
        </AppContext.Provider>
    )
}

export default AppProvider