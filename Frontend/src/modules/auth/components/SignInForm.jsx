import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../../../api'
// import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../../../constants'
import { useDispatch } from 'react-redux'
import { addAccessToken } from '../../../features/auth/authSlice'

function SignInForm() {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const submitHandler = async (e) => {
        e.preventDefault()
        try {
            const res = await api.post('/user/sign-in', { name, password })
            console.log(res.data)
            if (res.status === 200 && res.data?.accessToken) {
                dispatch(addAccessToken(res.data.accessToken));
                navigate("/user-home");
            } else {
                console.error("Login failed: invalid response", res);
            }

        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div className='flex items-center justify-center w-full h-screen'>
            <form onSubmit={submitHandler} className='flex flex-col items-center gap-5 px-5 py-3'>
                <h1 className='text-2xl font-medium text-blue-800'>Sign In</h1>
                <input
                    placeholder='Name'
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className='py-3 px-6 border rounded-2xl border-gray-300 hover:border-gray-600'
                />
                <input
                    placeholder='password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className='py-3 px-6 border rounded-2xl border-gray-300 hover:border-gray-600'
                />
                <button type='submit' className='py-2 px-5 bg-blue-800 rounded-2xl text-white'>Submit</button>
                <h3>Create an account? <Link to="/signup"><span>Sign Up</span></Link></h3>
            </form>
        </div>
    )
}

export default SignInForm