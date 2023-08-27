import {Archive, ArrowBigDown, ArrowBigUp, EditIcon, MoreHorizontal} from "lucide-react"

import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


type Props = {
    onDelete: () => void
}

// const TaskMenu = ({task, onEdit, onDelete}) => {
const TaskMenu = ({onDelete}: Props) => {
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
                variant="outline"
                className="px-1 my-0 w-8 h-8 text-xs"><MoreHorizontal/></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator/>
            {/*<DropdownMenuItem className="hover:cursor-pointer">*/}
            {/*    <EditIcon className="mr-2 h-4 w-4"/>*/}
            {/*    <span>Edit title</span>*/}
            {/*</DropdownMenuItem>*/}
            {/*<DropdownMenuItem className="hover:cursor-pointer">*/}
            {/*    <ArrowBigUp className="mr-2 h-4 w-4"/>*/}
            {/*    <span>Move up</span>*/}
            {/*</DropdownMenuItem>*/}
            {/*<DropdownMenuItem className="hover:cursor-pointer">*/}
            {/*    <ArrowBigDown className="mr-2 h-4 w-4"/>*/}
            {/*    <span>Move down</span>*/}
            {/*</DropdownMenuItem>*/}
            {/*<DropdownMenuSeparator/>*/}
            <DropdownMenuItem className="text-red-600 hover:cursor-pointer" onClick={onDelete}>
                <Archive className="mr-2 h-4 w-4"/>
                <span>Delete</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
}

export default TaskMenu;