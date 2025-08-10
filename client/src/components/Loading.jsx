import { AppContext } from "../context/AppContext";
import { useEffect } from "react";
import { useContext } from "react";
import { useLocation } from "react-router-dom";

const Loading = () => {

    const {navigate} = useContext(AppContext);
    const {search} = useLocation();
    const query=new URLSearchParams(search);
    const nextUrl = query.get("next");

    useEffect(()=>{
        if(nextUrl){
            setTimeout(()=>{
                navigate(`/${nextUrl}`);
            },5000);
        }
    },[nextUrl]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 border-t-primary"></div>
        </div>
    );
};

export default Loading;