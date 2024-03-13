"use client";

import axios from "axios";
import Link from "next/link";
import React, { useEffect } from 'react';
import {useRouter} from "next/navigation";


export default function page() {
    const router = useRouter();
    const [user, setUser] = React.useState({
        email: "",
        password: "",
        username: "",
    })
    const [buttonDisabled, setButtonDisabled] = React.useState(false);

    const onSignup = async () => {
        try {
            const response = await axios.post("/api/users/signup", user);
            console.log("Signup success", response.data);
            router.push("/login");
        } catch (error:any) {
            console.log("Signup failed", error.message);
        }
    }

    useEffect(() => {
        if(user.email.length > 0 && user.password.length > 0 && user.username.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user]);


    return (
        <div className="flex flex-col items-center justify-center bg-[#121212] max-w-96 min-h-96 mx-auto rounded-3xl mt-52 pt-12 pb-12">
            <h1 className="text-4xl font-semibold mt-4 mb-8">Sign Up</h1>
            <input
                className="p-1.5 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black"
                id="username"
                type="text"
                value={user.username}
                onChange={(e) => setUser({...user, username: e.target.value})}
                placeholder="Username"
            />
            <input
                className="p-1.5 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black"
                id="email"
                type="text"
                value={user.email}
                onChange={(e) => setUser({...user, email: e.target.value})}
                placeholder="Email"
            />
            <input
                className="p-1.5 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-black"
                id="password"
                type="password"
                value={user.password}
                onChange={(e) => setUser({...user, password: e.target.value})}
                placeholder="Password"
            />
            <button 
                onClick={onSignup}
                disabled={buttonDisabled}
                className={`p-1.5 px-5 rounded-lg mb-4 mt-6 border border-gray-600
                ${!buttonDisabled ? "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500" : "text-gray-600"}`}>
                    Sign Up
            </button>
            <div className="text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline">
                    Login here
                </Link>
            </div>
        </div>
    )
}
