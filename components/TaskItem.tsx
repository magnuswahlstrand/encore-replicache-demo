import * as React from 'react';
import {ChangeEvent} from 'react';
import {cn} from "@/lib/utils";
import TaskMenu from "@/components/TaskMenu";


type Props = {
    id: string
    title: string
    completed: boolean
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    onDelete: () => void
};
export const TaskItem = ({id, title, completed, onChange, onDelete}: Props) => {
    return (
        <div>
            <input type="checkbox" id={`task_${id}`} className="hidden"
                   onChange={onChange} checked={completed}/>
            <label className="flex items-center h-10 px-2 rounded cursor-pointer hover:bg-gray-100"
                   htmlFor={`task_${id}`}>
					<span
                        className={cn(
                            "flex items-center justify-center w-5 h-5 text-transparent border-2 border-gray-300 rounded-full",
                            {
                                "bg-green-500 border-green-500 text-white": completed,
                            }
                        )}
                    >
						<svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                             fill="currentColor">
							<path fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"/>
						</svg>
					</span>
                <div className={cn("ml-4 text-sm overflow-ellipsis max-w-full truncate", {
                    "line-through": completed,
                    "text-gray-400": completed,
                })}> {title}</div>
                <TaskMenu onDelete={onDelete}/>
            </label>
        </div>
    )
};