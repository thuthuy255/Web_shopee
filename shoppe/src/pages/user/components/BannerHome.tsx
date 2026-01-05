import { Col, Row } from "antd";
import { memo } from "react";
import BannerSlider from "../../../components/user/banner/BannerSlider";
import BannerStatic from "../../../components/user/banner/BannerStatic";

function BannerHome() {
  return (
    <Row gutter={[8, 8]} style={{ height: "100%" }}>
      {/* Slider */}
      <Col
        xs={24}
        md={15}
        style={{
          height: "100%",
          borderRadius: 10,
          overflow: "hidden",
          minHeight: 200,
        }}
      >
        <BannerSlider bannerTypes={["homepage", "Top Banner", "Top Banner 1"]} />
      </Col>


      {/* Static banners */}
      <Col
        xs={0} // Ẩn khi <576px
        sm={0} // Ẩn khi <768px
        md={9} // Chỉ hiển thị từ md trở lên
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ flex: 1, borderRadius: 10, overflow: "hidden" }}>
          <BannerStatic bannerType="homepage" index={0} />
        </div>
        <div style={{ flex: 1, borderRadius: 10, overflow: "hidden" }}>
          <BannerStatic bannerType="Top Banner" index={1} />
        </div>
        <div style={{ flex: 1, borderRadius: 10, overflow: "hidden" }}>
          <BannerStatic bannerType="Top Banner 1" index={2} />
        </div>
      </Col>
    </Row>
  );
}

export default memo(BannerHome);
