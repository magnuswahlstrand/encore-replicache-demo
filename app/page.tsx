import Chat from "@/components/Chat"
import {Task} from "@/components/Task";
import {TaskList} from "@/components/TaskList";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between py-10">
            <Chat/>
            <TaskList/>
        </main>
    )
}
