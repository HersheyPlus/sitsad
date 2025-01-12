import { IItem } from "@/types/item";

interface IProps {
    data: IItem;
    selected?: boolean;
}

const Item = ({ data, selected = false }: IProps) => {
    const bgColor = data.available ? 'bg-green-500' : 'bg-gray-500';

    // Add Tailwind classes for selected animation
    const selectedStyles = selected
        ? 'ring-4 ring-blue-500 animate-pulse' // Highlight with a blue ring and pulse animation
        : '';


    return (
        <div
            className={`${bgColor} ${selectedStyles} rounded-lg flex items-center justify-center text-white font-bold`}
            style={{ width: `${data.width}px`, height: `${data.height}px` }}
        >
            {data.name}
        </div>
    );
};

export default Item;
