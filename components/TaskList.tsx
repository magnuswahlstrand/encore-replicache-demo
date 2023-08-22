import * as React from 'react';
import {TaskItem} from "@/components/TaskItem";
import {Task} from "@/types/types";

const tasks = [
    {
        id: 1,
        title: "Weed front garden.",
        completed: true,
    },
    {
        id: 2,
        title: "Chill and smoke some Old Toby.",
        completed: true,
    },
    {
        id: 3,
        title: "Keep ring secret and safe.",
        completed: false,
    }
]

type Props = { tasks: Task[], onTaskCompleted?: (update: { id: string, completed: boolean }) => void }
export const TaskList = ({tasks, onTaskCompleted}: Props) => {
    return (
        <>
            {
                tasks.map((task) =>
                    <TaskItem key={task.id}
                              id={task.id}
                              title={task.title} completed={task.completed} onChange={
                        (e) => {
                            console.log("onChange", e.target.checked, task.id)
                            if (onTaskCompleted)
                                onTaskCompleted({id: task.id, completed: e.target.checked})
                        }
                    }/>)
            }
        </>
    )
};