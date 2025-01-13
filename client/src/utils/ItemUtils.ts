import { IItem, IItemPayload } from "@/types/item";

const convertToSlug = (text: string) => {
    return text
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
}

// const findItemTypeBySlug = (itemType: string | undefined) => {
//     switch (itemType) {
//         case ItemType.TABLE:
//             return ItemType.TABLE;

//         case ItemType.TOILET:
//             return ItemType.TOILET;
//         default:
//             return undefined
//     }
// }

const convertToPayload = (item: IItem): IItemPayload => {
    return {
        item_id: item.item_id,
        type: item.type,
        available: item.available,
        position_x: item.position_x,
        position_y: item.position_y,
        width: item.width,
        height: item.height,
        name: item.name,
        room_id: item.location.room.room_id
    }
}

export default {
    convertToSlug,
    convertToPayload
}