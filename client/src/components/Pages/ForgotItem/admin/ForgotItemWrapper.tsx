import { Flex } from "antd";
import { useEffect, useState } from "react";
import { useNotificationStore } from "@/stores/notification.store";
import ForgotItemFilter from "../ForgotItemFilter";
import ForgotItemService from "@/services/forgot-item.service";
import { IForgot } from "@/types/forgot-item";
import ForgotItemTable from "./ForgotItemTable";
import ForgotItemModal from "./ForgotItemModal";

const ForgotItemWrapper = () => {
    const [data, setData] = useState<IForgot[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [query, setQuery] = useState<string>("");
    const [editingItem, setEditingItem] = useState<IForgot | null>(null);
    const openNotification = useNotificationStore(
        (state) => state.openNotification
    )

    useEffect(() => {
        doSearch()
    }, [])

    const doSearch = async () => {
        // do something
        try {
            const data = await ForgotItemService.findByKeyword(query)
            setData(data)
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).message
            })
        }

    }

    const openAddModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const doEdit = (record: IForgot) => {
        setEditingItem(record);
        setIsModalOpen(true);
    };

    const doDelete = (id: string) => {
        setData((prevData) => prevData.filter((item) => item.id !== id));
    };

    const doSave = async (payload: IForgot) => {
        if (editingItem) {
            setData((prevData) =>
                prevData.map((item) =>
                    item.id === editingItem.id ? { ...editingItem, ...payload } : item
                )
            );

            try {
                await ForgotItemService.update(payload)

                openNotification({
                    type: 'success',
                    message: 'Success',
                    description: 'Forgotten Item updated successfully'
                })
            } catch (error) {
                openNotification({
                    type: 'error',
                    message: 'Error',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    description: (error as any).message
                })
            }
        } else {
            setData((prevData) => [
                ...prevData,
                { ...payload, id: Math.random().toString(36).substr(2, 9) },
            ]);

            try {
                await ForgotItemService.create(payload)

                openNotification({
                    type: 'success',
                    message: 'Success',
                    description: 'Forgotten Item created successfully'
                })
            } catch (error) {
                openNotification({
                    type: 'error',
                    message: 'Error',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    description: (error as any).message
                })
            }
        }
        setIsModalOpen(false);
    };

    return (
        <Flex vertical gap={4} className="p-4">
            <ForgotItemFilter doChangeQuery={setQuery} doSearch={doSearch} />

            <ForgotItemTable
                data={data}
                onAdd={openAddModal}
                onEdit={doEdit}
                onDelete={doDelete}
            />

            <ForgotItemModal
                visible={isModalOpen}
                editingItem={editingItem}
                onCancel={() => setIsModalOpen(false)}
                onSave={doSave}
            />

        </Flex>
    );
};

export default ForgotItemWrapper;
