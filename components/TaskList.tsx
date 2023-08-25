import * as React from 'react';
import {TaskItem} from "@/components/TaskItem";
import {Task} from "@/types/types";


type Props = {
    tasks: Task[],
    onTaskCompleted?: (update: { id: string, completed: boolean }) => void
    onTaskDeleted?: (update: { id: string }) => void
}
export const TaskList = ({tasks, onTaskCompleted, onTaskDeleted}: Props) => {
    return (
        <>
            {
                tasks.map((task) =>
                    <TaskItem key={task.id}
                              id={task.id}
                              title={task.title} completed={task.completed}
                              onChange={
                                  (e) => {
                                      console.log("onChange", e.target.checked, task.id)
                                      if (onTaskCompleted)
                                          onTaskCompleted({id: task.id, completed: e.target.checked})
                                  }
                              }
                              onDelete={
                                  () => {
                                      if (onTaskDeleted)
                                          onTaskDeleted({id: task.id})
                                  }
                              }

                    />
                )
            }
        </>
    )
};