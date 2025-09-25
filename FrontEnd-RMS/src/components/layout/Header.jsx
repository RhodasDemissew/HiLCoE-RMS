import React, { useState } from "react";
import NavBar from "./NavBar";
import Button from "../ui/button";
import SearchBar from "../ui/searchBar";

const Header = () => {
    const [searchQuery, setSearchQuery] = useState("");
    return (
        <div className="min-h-220 mb-1 bg-cover bg-center  mt-18 flex-items-center w-full overflow-hidden" 
            style={{backgroundImage: "url('../src/assets/svg/Group_85.svg')"}} id="Header">
                <NavBar />
                <div className="absolute bg-blue-500 w-60 h-1.5 mt-20 ml-48 rounded-sm"></div>
                <div className="absolute mt-35 ml-58 text-5xl text-white font-black font-poppins "><span className="font-extralight">Simplifying Academic</span> Research</div>
                <div className="absolute mt-50 ml-58  text-5xl text-white font-black font-poppins font-stretch-expanded">Management System</div>
                <div className="absolute mt-70 ml-58 text-3xl text-white font-extralight font-poppins">Plan, monitor, and evaluate research projects <br />from start to submission — powered by AI.</div>
                <Button caption="Get Started" className="absolute mt-100 ml-58 bg-blue-500 text-white text-xl font-poppins font-semibold rounded-xl px-14 py-5 cursor-pointer" />
                <div className="absolute bg-blue-950 w-350 h-40 mt-160 ml-65 rounded-xl ">
                    <SearchBar 
                        placeholder="Find a Research..." 
                        value={searchQuery}
                        onChange={setSearchQuery}
                        className={'absolute w-260 h-10 mt-13 ml-25'}
                    />
                    <Button caption="Search" className="absolute top-12 ml-290 bg-blue-500 text-white text-md font-poppins font-semibold rounded-xl px-16 py-5 cursor-pointer" />
                    {/* <div className="absolute bg-amber-100 w-260 h-20 mt-10 ml-25 "><input type="text"  /></div> */}
                </div>
                <div className="absolute w-180 h-137 ml-250 mt-20 bg-cover bg-center"  style={{backgroundImage: "url('../src/assets/svg/Group_86.svg')"}} /*id="Desktop"*/></div>
                
        </div>
    )
}

export default Header    