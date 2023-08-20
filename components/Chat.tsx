"use client"

import React, {FormEvent, useEffect, useState} from 'react';
import {Replicache, WriteTransaction} from 'replicache';
import {useSubscribe} from 'replicache-react';
import {nanoid} from "nanoid";

type Message = {
    from: string
    content: string
    order: number
}


const REPLICACHE_LICENSE_KEY = process.env.NEXT_PUBLIC_REPLICACHE_LICENSE_KEY ?? ""
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

const createMessage = async (tx: WriteTransaction,
                             {id, from, content, order}: Message & { id: string }) => {
    await tx.put(`message/${id}`, {
        from,
        content,
        order,
    });
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
    createMessage: createMessage,
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

    const contentRef = React.createRef<HTMLInputElement>();

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const last = messages.length && (messages[messages.length - 1][1].order ?? 0);
        const order = last + 1;

        if (!contentRef.current) return;

        rep?.mutate.createMessage({
            id: nanoid(),
            from: "Magnus",
            content: contentRef.current.value,
            order,
        });
        contentRef.current.value = '';
    };


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
            <form onSubmit={onSubmit}>
                <input ref={contentRef} className={"border"}/>
                <button>Send</button>
            </form>
        </div>
    );
}

export default function ChatWithUserId() {
    return <Chat userId={"MAGNUS"}/>
}

