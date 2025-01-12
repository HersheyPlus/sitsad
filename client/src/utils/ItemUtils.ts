
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

export default {
    convertToSlug
}