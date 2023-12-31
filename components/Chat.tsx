"use client"

import React, {FormEvent, useEffect, useState} from 'react';
import {Replicache, WriteTransaction} from 'replicache';
import {useSubscribe} from 'replicache-react';
import {nanoid} from "nanoid";

import {Task} from "@/types/types";
import {TaskList} from "@/components/TaskList";
import {useWebsocket} from "@/lib/websockets";
import {API_BASE_URL, REPLICACHE_LICENSE_KEY, WS_BASE_URL} from "@/lib/env";


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

const deleteTask = async (tx: WriteTransaction, update: { id: string }) => {
    await tx.del(`task/${update.id}`)
}


const mutators = {
    addTask,
    setTaskCompleted,
    deleteTask
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

    const [ws] = useWebsocket(WS_BASE_URL + `/ws/subscribe`)

    useEffect(() => {
        if (rep)
            return

        if (ws === null) {
            console.info("Websocket not connected. Wait a bit")
            return
        }

        const r = new Replicache({
            name: userId,
            licenseKey: REPLICACHE_LICENSE_KEY,
            pushURL: API_BASE_URL + '/api/replicache-push',
            pullURL: API_BASE_URL + '/api/replicache-pull',
            // pullInterval: 5 * 1000,
            mutators
        })
        setRep(r);


        ws.onmessage = (e: MessageEvent) => {
            console.log('got poked', e);
            r?.pull()
        }
        console.info("success")
    }, [ws]);

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
                    <h4 className="font-semibold ml-3 text-lg">Your tasks</h4>
                </div>
                <TaskList
                    tasks={tasksSimple}
                    onTaskCompleted={rep?.mutate.setTaskCompleted}
                    onTaskDeleted={rep?.mutate.deleteTask}
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

export default Chat