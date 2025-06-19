import React, { useState, useContext } from 'react';
import { FaLinkedin, FaGithub, FaFacebook, FaXTwitter } from "react-icons/fa6";
import { UserContext } from '../Context/GlobalContext';

const LoginUser = () => {
    const { setLoggedInUser } = useContext(UserContext);
  const [message, setMessage] = useState('');
const [loginUser, setLoginUser] = useState({
  userName: 'zeeshan',
  password: '123',
  status: 'approved'
});


  const handleSubmit = (e) => {
    e.preventDefault();

    const allUsers = JSON.parse(localStorage.getItem('getRegisterUser')) || [];
    const matchedUser = allUsers.find(
      user => user.fullName === loginUser.userName && user.password === loginUser.password
    );

    if (matchedUser) {
      if (matchedUser.status === 'pending') {
        setMessage('Your registration is pending admin approval.');
      } else {
        setMessage('Login successful!');
        setLoggedInUser(matchedUser);

        // Save only username or fullname
        const nameToStore = matchedUser.userName || matchedUser.fullName;
        localStorage.setItem('loggedInUser', JSON.stringify({ name: nameToStore }));
      }
    } else {
      setMessage('Invalid credentials. Please try again.');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

      <input
        type="text"
        name="userName"
        value={loginUser.userName}
        onChange={handleChange}
        placeholder="Username"
        className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      <input
        type="password"
        name="password"
        value={loginUser.password}
        onChange={handleChange}
        placeholder="Password"
        className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      <button
        type="submit"
        className="w-full p-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
      >
        Login
      </button>

      {message && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-center">
          {message}
        </div>
      )}

      <p className="mt-4 text-center text-sm text-gray-600">
  Don't have an account?{" "}
  <a
    href="#"
    onClick={() => (window.location.href = "/RegisterUser")}
    className="text-blue-500 font-medium hover:underline"
  >
    Sign Up
  </a>
</p>


      <p className="mt-4 text-center text-sm flex justify-center gap-4">
        <a href="#" className="p-2 bg-gray-200 rounded-full hover:bg-blue-500 text-blue-700 hover:text-white transition">
          <FaLinkedin />
        </a>
        <a href="#" className="p-2 bg-gray-200 rounded-full hover:bg-black text-black hover:text-white transition">
          <FaGithub />
        </a>
        <a href="#" className="p-2 bg-gray-200 rounded-full hover:bg-blue-600 text-blue-700 hover:text-white transition">
          <FaFacebook />
        </a>
        <a href="#" className="p-2 bg-gray-200 rounded-full hover:bg-black text-black hover:text-white transition">
          <FaXTwitter />
        </a>
      </p>
    </form>
  );
};

export default LoginUser;
