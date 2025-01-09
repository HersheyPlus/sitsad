import { useParams } from "react-router-dom";

const TableSlugPage = () => {
    const params = useParams();

    return (
        <div>
            <p>Slug: {params.slug}</p>
        </div>
    )
}

export default TableSlugPage