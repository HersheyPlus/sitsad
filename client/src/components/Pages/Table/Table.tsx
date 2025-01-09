import { ITable } from '@/types/table';


interface IProps {
    data: ITable
}

const Table = ({ data }: IProps) => {
    const bgColor = data.available ? 'bg-green-500' : 'bg-gray-500';

    return (
        <div
            className={`${bgColor} rounded-lg flex items-center justify-center text-white font-bold`}
            style={{ width: `${data.width}px`, height: `${data.height}px` }}
        >
            Table {data.id}
        </div>
    );
};

export default Table;

