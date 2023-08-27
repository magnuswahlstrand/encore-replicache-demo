import Chat from "@/components/Chat"
import {cookies} from 'next/headers'
import {redirect} from "next/navigation";
import React from "react";
import {cn} from "@/lib/utils";
import {IS_DEV} from "@/lib/env";

export default function Home() {
    const cookieStore = cookies()
    const idCookie = cookieStore.get('redid')
    console.log("THEME", idCookie?.value)

    const id = idCookie?.value
    if (!id)
        redirect('/set_id')

    return (
        <>
            <div className={cn("fixed top-0 right-0 p-2 text-xs text-white flex flex-col truncate overflow-hidden", {
                "bg-green-700": IS_DEV,
            })}>
                <div><span className="w-14 font-semibold inline-block">ENV:</span>{process.env.NODE_ENV}</div>
                <div><span className="w-14 font-semibold inline-block">USER ID:</span>{id}</div>
            </div>
            <main className="flex min-h-screen flex-col items-center py-10">
                <Chat userId={id}/>
            </main>
        </>
    )
}