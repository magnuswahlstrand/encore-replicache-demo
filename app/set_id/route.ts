import {cookies} from "next/headers";
import {randomUUID} from "crypto";
import {redirect} from "next/navigation";

export async function GET() {
    cookies().set({
        name: 'redid',
        value: randomUUID().substring(0, 13),
        httpOnly: true,
        path: '/',
        maxAge: 3600 * 24 * 400,
    })
    redirect("/")
}