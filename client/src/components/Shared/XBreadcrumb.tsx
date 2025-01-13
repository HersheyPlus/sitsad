import { Breadcrumb } from "antd";

interface IProps {
    items: {
        title: string | JSX.Element;
        icon?: JSX.Element; // Optional icons for breadcrumbs
    }[];
}

const XBreadcrumb = ({ items }: IProps) => {
    return (
        <Breadcrumb
            style={{
                marginBottom: 20,
                fontSize: 18,
                padding: 16,
                borderRadius: 8,
                backgroundColor: "#f0f8ff",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            }}
            separator="/"
        >
            {items.map((item, index) => (
                <Breadcrumb.Item
                    key={index}
                >
                    <span style={{
                        display: "flex",
                        alignItems: "center",
                        color: index === items.length - 1 ? "#1890ff" : "#595959", // Highlight the last item
                        fontWeight: index === items.length - 1 ? "semibold" : "normal", // Bold last item
                    }}>
                        {item.icon && (
                            <span style={{ marginRight: 5, display: "flex", alignItems: "center" }}>
                                {item.icon}
                            </span>
                        )}
                        {item.title}
                    </span>

                </Breadcrumb.Item>
            ))}
        </Breadcrumb>
    );
};

export default XBreadcrumb;
