"use client"

import React, {FormEvent, useEffect, useState} from 'react';
import {Replicache, WriteTransaction} from 'replicache';
import {useSubscribe} from 'replicache-react';
import {nanoid} from "nanoid";

import {Task} from "@/types/types";
import {TaskList} from "@/components/TaskList";


const REPLICACHE_LICENSE_KEY = process.env.NEXT_PUBLIC_REPLICACHE_LICENSE_KEY ?? ""
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

const addTask = async (tx: WriteTransaction, task: Omit<Task, "completed">) => {
    await tx.put(`task/${task.id}`, {
        ...task,
        completed: false,
    });
}
const setTaskCompleted = async (tx: WriteTransaction, update: { id: string, completed: boolean }) => {
    const t = await tx.get(`task/${update.id}`)
    if (!t) {
        throw new Error(`Task ${update.id} not found`);
    }
    // TODO: Better type checking?
    const task = t as Task;

    await tx.put(`task/${update.id}`, {
        ...task,
        completed: update.completed,
    });
}


const mutators = {
    addTask,
    setTaskCompleted
}

function Chat({userId}: { userId: string }) {
    const [rep, setRep] = useState<Replicache<typeof mutators> | null>(null);

    const tasks = useSubscribe(
        rep,
        async tx => {
            const list = (await tx
                .scan({prefix: 'task/'})
                .entries()
                .toArray()) as [string, Task][];
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
        const last = tasks.length && (tasks[tasks.length - 1][1].order ?? 0);
        const order = last + 1;

        if (!contentRef.current) return;

        rep?.mutate.addTask({
            id: nanoid(),
            title: contentRef.current.value,
            order,
        });
        contentRef.current.value = '';
    };


    console.log("tasks", tasks)

    const tasksSimple = tasks.map(([, task]) => task)

    return (
        <div>

            <div className="max-w-full p-8 bg-white rounded-lg shadow-lg w-96">
                <div className="flex items-center mb-6">
                    <svg className="h-8 w-8 text-indigo-500 stroke-current" xmlns="http://www.w3.org/2000/svg"
                         fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                    <h4 className="font-semibold ml-3 text-lg">Frodo's Jobs</h4>
                </div>
                <TaskList
                    tasks={tasksSimple}
                    onTaskCompleted={rep?.mutate.setTaskCompleted}
                />
                <button className="flex items-center w-full h-8 px-2 mt-2 text-sm font-medium rounded">
                    <svg className="w-5 h-5 text-gray-400 fill-current" xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    <form onSubmit={onSubmit}>
                        {/*<input ref={contentRef} className={"border"}/>*/}
                        <input
                            ref={contentRef}
                            className="flex-grow h-8 ml-4 bg-transparent focus:outline-none font-medium"
                            type="text"
                            placeholder="add a new task"/>
                        {/*<button>Send</button>*/}
                    </form>
                </button>
            </div>
        </div>
    );
}

export default function ChatWithUserId() {
    return <Chat userId={"MAGNUS"}/>
}

