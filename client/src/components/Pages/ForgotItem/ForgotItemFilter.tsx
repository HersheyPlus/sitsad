/* eslint-disable @typescript-eslint/no-explicit-any */

import XCollapse from "@/components/Shared/XCollapse";
import { Space, Row, Col, Button, DatePicker } from "antd";

const { RangePicker } = DatePicker;

interface IProps {
    doChangeQuery: (value: any) => void;
    doSearch: () => void;
}

const ForgotItemFilter = ({ doChangeQuery, doSearch }: IProps) => {
    return (
        <XCollapse title="Search for item...">
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={4}>
                        <RangePicker
                            onChange={(dates) => dates && doChangeQuery(dates)}
                            style={{ width: "100%" }}
                        />
                    </Col>


                    <Button type="primary" onClick={doSearch} className="ml-auto">
                        Search
                    </Button>
                </Row>
            </Space>
        </XCollapse>
    )
}

export default ForgotItemFilter