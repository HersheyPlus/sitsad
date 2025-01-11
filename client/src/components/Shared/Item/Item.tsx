import { IItem } from "@/types/item";

interface IProps {
    data: IItem
}

const Item = ({ data }: IProps) => {
    const bgColor = data.available ? 'bg-green-500' : 'bg-gray-500';

    return (
        <div
            className={`${bgColor} rounded-lg flex items-center justify-center text-white font-bold`}
            style={{ width: `${data.width}px`, height: `${data.height}px` }}
        >
            {data.name}
        </div>
    );
};

export default Item;

