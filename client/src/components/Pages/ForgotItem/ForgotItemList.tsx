import { IForgot } from "@/types/forgot-item"
import ForgotItem from "./ForgotItem"

interface IProps {
    items: IForgot[]
    onSelect: (item: IForgot | null) => void
}

const ForgotItemList = ({ items, onSelect }: IProps) => {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
                <div key={item.id} onClick={() => onSelect(item)}>
                    <ForgotItem item={item} />
                </div>
            ))}
        </div>
    )
}

export default ForgotItemList