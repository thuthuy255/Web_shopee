import { useEffect, useState } from "react";
import { Carousel, message } from "antd";
import { getBannerByType } from "../../../api/banner/banner.api";
import LoadingDefault from "../../loading/LoadingDefault";
import "../../../css/components/banner/BannerSlider.css";
interface BannerSliderProps {
  bannerType: string;
}

const BannerSlider = ({ bannerType }: BannerSliderProps) => {
  const [data, setData] = useState<any[]>([]);
  console.log("🚀 ~ BannerSlider ~ data:", data);
  const [loading, setLoading] = useState(false);

  const fetchBanner = async () => {
    setLoading(true);
    try {
      const res: any = await getBannerByType(bannerType.toLowerCase());
      if (res.success) {
        setData(res.data || []);
      } else {
        message.error("Không thể lấy danh sách banner");
      }
    } catch (error) {
      console.error(error);
      message.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, [bannerType]); // <- Gọi lại khi bannerType thay đổi

  if (loading) {
    return <LoadingDefault />;
  }

  return (
    <Carousel
      autoplay
      className="w-full"
      style={{ borderRadius: 10, overflow: "hidden" }}
    >
      {data?.map((banner: any) => (
        <div
          key={banner.id}
          className="flex justify-center items-center bg-white containerBanner"
        >
          <div
            key={banner.id}
            className="bannerItem"
            style={{
              backgroundImage: `url(${banner.imageUrl})`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.01)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          ></div>
        </div>
      ))}
    </Carousel>
  );
};

export default BannerSlider;
