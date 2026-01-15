import React from 'react'

function Upload() {
    const submitHandler =  async () => {

    }
  return (
    <div className='flex w-full min-h-screen flex-col items-center justify-center'>
        <form onSubmit={submitHandler} className='flex flex-col items-center justify-end gap-5 w-[80%] h-[90%] px-6 py-6 bg-gray-200'>
            <input 
            type="file"
            placeholder='Upload csv File'
            className='py-3 px-6 border rounded-2xl border-gray-300 hover:border-gray-600'
            />
            <input 
            type="text"
            placeholder='What u want to predict?'
            className='py-3 px-6 border rounded-2xl border-gray-300 hover:border-gray-600'
            />
        </form>
    </div>
  )
}

export default Upload