"use client"

import React, {useEffect, useState} from 'react';
import {Replicache, WriteTransaction} from 'replicache';
import {useSubscribe} from 'replicache-react';

type Message = {
    from: string
    content: string
    order: int
}


const REPLICACHE_LICENSE_KEY = process.env.NEXT_PUBLIC_REPLICACHE_LICENSE_KEY ?? ""
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

const updateUser = async (tx: WriteTransaction, user: User) => {
    await tx.put(`user/${user.id}`, user);
    console.log('message put')
}


// const emojis = [
//     '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
//     '👋', '👍', '👎', '👌', '👏', '🙌', '🤝', '🙏',
//     // Flowers
//     '🌻', '🌼', '🌸', '🌺', '🥀', '🌹', '🌷', '🌼',
//     // Animals
//     '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'
// ];

const mutators = {
    updateUser,
}

function Chat({userId}: { userId: string }) {
    const [rep, setRep] = useState<Replicache<typeof mutators> | null>(null);

    const messages = useSubscribe(
        rep,
        async tx => {
            const list = (await tx
                .scan({prefix: 'message/'})
                .entries()
                .toArray()) as [string, Message][];
            list.sort(([, {order: a}], [, {order: b}]) => a - b);
            return list;
        },
        [],
    );

    useEffect(() => {
        if (rep)
            return

        const r = new Replicache({
            name: userId,
            licenseKey: REPLICACHE_LICENSE_KEY,
            pushURL: BASE_URL + '/api/replicache-push',
            pullURL: BASE_URL + '/api/replicache-pull',
            mutators
        })
        console.log(BASE_URL)
        console.log(BASE_URL + '/api/replicache-pull')
        setRep(r);

        // function listen() {
        //     console.log('listening');
        //     // Listen for pokes, and pull whenever we get one.
        //     Pusher.logToConsole = true;
        //     const pusher = new Pusher(process.env.NEXT_PUBLIC_REPLICHAT_PUSHER_KEY ?? "", {
        //         cluster: process.env.NEXT_PUBLIC_REPLICHAT_PUSHER_CLUSTER ?? "",
        //     });
        //     const channel = pusher.subscribe('default');
        //     channel.bind('poke', () => {
        //         console.log('got poked');
        //         r?.pull();
        //     });
        // }
        //
        // // TODO Handle async?
        // r.mutate.updateUser({
        //     id: userId,
        //     name: "Magnus",
        //     icon: randomEmoji(),
        // })
        //
        // listen();
        // // TODO: Unlisten here?

    }, []);


    // async function handleEmojiSelected(emoji: string) {
    //     await rep?.mutate.updateUser({
    //         id: userId,
    //         name: "Magnus",
    //         icon: emoji,
    //     });
    // }

    console.log("messages", messages)


    return (
        <div>
            <ul>
                {messages.map(([id, msg]) => {
                    return (
                        <li key={msg.order}>
                            {msg.from}: {msg.content}
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}

export default function ChatWithUserId() {
    return <Chat userId={"MAGNUS"}/>
}

