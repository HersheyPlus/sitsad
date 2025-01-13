import React, { useEffect, useState } from "react";
import { Card, Spin, Image, Typography } from "antd";
import { IForgot } from "@/types/forgot-item";
import ForgotItemService from "@/services/forgot-item.service";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const { Title } = Typography;

const ForgotItemSlider: React.FC = () => {
    const [forgotItems, setForgotItems] = useState<IForgot[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const items = await ForgotItemService.findAll();
                setForgotItems(items);
            } catch (error) {
                console.error("Error fetching forgot items:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 3,
            slidesToSlide: 1
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2,
            slidesToSlide: 1
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
            slidesToSlide: 1
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (forgotItems.length === 0) {
        return <div className="text-center">No items available at the moment.</div>;
    }

    return (
        <div className="w-full p-4">
            <Title level={3} className="mb-6 text-blue-800">
                Welcome to SIT Krana
            </Title>
            <Carousel
                responsive={responsive}
                infinite={true}
                autoPlay={true}
                autoPlaySpeed={3000}
                keyBoardControl={true}
                customTransition="all .5"
                transitionDuration={500}
                containerClass="carousel-container"
                removeArrowOnDeviceType={["tablet", "mobile"]}
                dotListClass="custom-dot-list-style"
                itemClass="carousel-item-padding-40-px"
            >
                {forgotItems.map((item) => (
                    <div key={item.id} className="px-2">
                        <Card
                            hoverable
                            cover={
                                <Image
                                    src={item.imageUrl}
                                    alt={`Forgot Item ${item.id}`}
                                    className="object-cover h-64"
                                />
                            }
                            className="mx-auto"
                        >
                            <Card.Meta
                                title={`Table ID: ${item.tableId}`}
                                description={`Date: ${item.date}`}
                            />
                        </Card>
                    </div>
                ))}
            </Carousel>
        </div>
    );
};

export default ForgotItemSlider;

