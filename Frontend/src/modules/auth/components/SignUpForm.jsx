import React, { useState } from 'react'
import api from '../../../../api'
import { Link, useNavigate } from 'react-router-dom'

function SignUpForm() {
    const[name , setName] = useState(null)
    const[password , setPassword] = useState(null)
    console.log(name , password)
    const navigate = useNavigate()
    const submitHandler = async (e) => {
        e.preventDefault()
        try {
            const res = await api.post('/User/sign-up' , {name , password})
            if(res.status == 200){
                navigate('/sign-in')
            }
        } catch (error) {
            console.log(error)
        }
    }
  return (
    <div className='flex items-center justify-center w-full h-screen'>
        <form onSubmit={submitHandler} className='flex flex-col items-center gap-5 shadow-2xl px-6 py-3'>
            <h1 className='text-2xl text-blue-700 font-medium'>Sign Up</h1>
            <input 
            placeholder='Name'
            value={name}
            onChange={e => setName(e.target.value)}
            className='py-3 px-6 border rounded-2xl border-gray-300 hover:border-gray-600'
            />
            <input 
            placeholder='Password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            className='py-3 px-6 border rounded-2xl border-gray-300 hover:border-gray-600'
            />
            <button type='submit' className='py-2 px-5 bg-blue-800 rounded-2xl text-white'>Submit</button>
            <h3>Already have an account? <Link to="/signin"><span>Sign In</span></Link></h3>
        </form>
    </div>
  )
}

export default SignUpForm