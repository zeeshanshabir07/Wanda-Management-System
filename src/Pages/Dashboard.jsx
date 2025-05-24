import {React, useState,useEffect} from 'react';
import WandaManage from '../Components/WandaManage';

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
    useEffect(() => {
    const userData = localStorage.getItem("getRegisterUser");
    if (userData) {
      setUserProfile(JSON.parse(userData));
    }
  }, []);
  return (
    <div className='flex flex-col h-screen w-full'>
      <div className='flex fixed top-0 left-0 w-full h-16 justify-between items-center bg-blue-800 text-white p-4'>
        <div className='text-2xl font-thin'>WMS - Wanda Management System</div>
        <div>
        <img 
  src={userProfile?.profilePic || '/default-avatar.png'} // fallback image
  className='object-cover rounded-full h-10 w-10 border-2 border-white' 
  alt="Profile" 
/>

        </div>
      </div>
      <div className='flex justify-between '>
      <aside className='bg-white shadow-md fixed top-16 left-0 h-[calc(100vh-4rem)] w-[220px] py-5 px-2 hidden md:block'>
          <h2 className='text-xl font-bold text-cyan-900 pb-4'>WMS - Dashboard</h2>
          <ul className='list-none'>
            <li className='py-2 my-1 hover:bg-blue-400 transition-all ease-in rounded-md hover:text-white px-2'><a className='' href="#">Dashboard</a></li>
            <li className='py-2 my-1  hover:bg-blue-400 transition-all ease-in rounded-md hover:text-white px-2'><a href="#">Wanda Managment</a></li>
            <li className='py-2 my-1  hover:bg-blue-400 transition-all ease-in rounded-md hover:text-white px-2'><a href="#">Wanda Print</a></li>
            <li className='py-2 my-1  hover:bg-blue-400 transition-all ease-in rounded-md hover:text-white px-2'><a href="#">All Shajrah</a></li>
            <li className='py-2 my-1  hover:bg-blue-400 transition-all ease-in rounded-md hover:text-white px-2'><a href="#">Wanda Managment</a></li>
            <li className='py-2 my-1  hover:bg-blue-400 transition-all ease-in rounded-md hover:text-white px-2'><a href="#">Settings</a></li>
            <li className='py-2 my-1  hover:bg-blue-400 transition-all ease-in rounded-md hover:text-white px-2'><a href="#">Logout</a></li>
          </ul>
        </aside>
        <div className='main-content ml-[220px] w-[calc(100%-220px)] h-full overflow-y-auto'>
  <WandaManage />
</div>

      </div>
    </div>
  );
};

export default Dashboard;