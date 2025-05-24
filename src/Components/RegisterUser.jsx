import React, { useState } from 'react';

const RegisterUser = () => {
    const [message, setMessage] = useState('');
    
   
    
  const [user, setUser] = useState({
    profilePic: '',
    fullName: '',
    email: '',
    password: '',
    status: 'approved'
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'profilePic' && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prev => ({
          ...prev,
          profilePic: reader.result, // Base64 string
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setUser(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Wait until profilePic is base64 (not empty string or null)
    if (!user.profilePic) {
      alert('Please wait for the image to finish loading.');
      return;
    }

    const existingUserData = JSON.parse(localStorage.getItem('getRegisterUser')) || [];
    const currentData = [...existingUserData, { ...user }];

    localStorage.setItem('getRegisterUser', JSON.stringify(currentData));
    console.log(currentData);
    setMessage('Registration pending. Wait for admin approval.');
    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000);
    setUser({
      profilePic: '',
      fullName: '',
      email: '',
      password: '',
      status: 'pending'
    });
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-center mb-6">Register</h2>

      <input
        type="file"
        accept="image/*"
        name="profilePic"
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={user.fullName}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={user.email}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={user.password}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
      <button
        type="submit"
        className="w-full p-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
      >
        Register
      </button>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="LoginUser.jsx" className="text-blue-500 font-medium hover:underline">Login</a>
      </p>
      {message && (
  <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-center">
    {message}
  </div>)}
      
    </form>
    
    
  );
};

export default RegisterUser;
