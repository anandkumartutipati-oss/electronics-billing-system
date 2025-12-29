import LoginModal from '../components/LoginModal'
import { useState } from 'react'

function Login() {
    // Ideally this background could be an Unsplash image from the user's domain
    return (
        <div
            className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
            style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2001&q=80")',
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]"></div>

            <LoginModal isOpen={true} onClose={() => { }} />
        </div>
    )
}

export default Login
