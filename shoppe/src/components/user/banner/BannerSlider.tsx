import { useEffect, useState } from "react";
import { Carousel, message } from "antd";
import { getBannerByType } from "../../../api/banner/banner.api";
import LoadingDefault from "../../loading/LoadingDefault";
import "../../../css/components/banner/BannerSlider.css";

interface BannerSliderProps {
  bannerTypes: string[]; // 👈 nhận mảng thay vì string
}

const BannerSlider = ({ bannerTypes }: BannerSliderProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      let allBanners: any[] = [];

      for (let type of bannerTypes) {
        const res: any = await getBannerByType(type.toLowerCase());
        if (res.success) {
          allBanners = [...allBanners, ...(res.data || [])];
        }
      }

      setData(allBanners);
    } catch (error) {
      console.error(error);
      message.error("Đã xảy ra lỗi khi tải banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [bannerTypes]);

  if (loading) {
    return <LoadingDefault />;
  }

  return (
    <Carousel
      autoplay                    // bật tự chạy
      autoplaySpeed={3000}        // 3 giây mỗi slide
      pauseOnHover={false}        // hover không dừng
      className="w-full"
      style={{ borderRadius: 10, overflow: "hidden" }}
    >
      {data?.map((banner: any) => (
        <div
          key={banner.id}
          className="flex justify-center items-center bg-white containerBanner"
        >
          <div
            className="bannerItem"
            style={{ backgroundImage: `url(${banner.imageUrl})` }}
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
