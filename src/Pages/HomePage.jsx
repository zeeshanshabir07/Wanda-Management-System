import React from 'react';
import RegisterUser from '../Components/RegisterUser';
import LoginUser from '../Components/LoginUser';
const HomePage = () => {
  return (
<div className=" flex items-center justify-center p-4">
    
      <div className="flex flex-col md:flex-row w-full  h-[420px] max-w-4xl bg-white shadow-lg rounded-2xl sm:overflow-hidden">
       
        <div className="sm:w-2/4 w-full bg-blue-500 p-8 flex flex-col items-center justify-center rounded-b-[20px]  sm:rounded-r-[50px] text-white gap-4">
          <h1 className="text-2xl font-bold text-center">Wanda Management System </h1>
          <p className="text-sm text-center leading-relaxed">
            This is a great initiative by the Government to digitize land records into a secure and efficient computerized system,
            ensuring transparency, accessibility, and trust for all citizens.
          </p>
          <button className="mt-2 bg-[#203f7a] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#1a2d5a] transition">
            Register Now
          </button>
        </div>

        {/* Right Section */}
        <div className="sm:w-2/4  w-full bg-white p-8 flex items-center justify-center">
         <RegisterUser/>
          <LoginUser/>
        </div> 
      </div>
    </div>
  );
};

export default HomePage;
