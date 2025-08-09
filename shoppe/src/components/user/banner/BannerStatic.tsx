import { useEffect, useState } from "react";
import { message } from "antd";
import { getBannerByType } from "../../../api/banner/banner.api";
import LoadingDefault from "../../loading/LoadingDefault";

interface BannerStaticProps {
  bannerType: string; // ví dụ: "homepage", "sale", "product"
  index: number;
}

const BannerStatic = ({ bannerType }: BannerStaticProps) => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res: any = await getBannerByType(bannerType.toLowerCase());
      if (res.success) {
        setBanners(res.data || []);
      } else {
        message.error("Không thể lấy danh sách banner");
      }
    } catch (error) {
      console.error(error);
      message.error("Đã xảy ra lỗi khi tải banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [bannerType]);

  if (loading) {
    return <LoadingDefault />;
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {banners?.map((banner: any) => (
        <div
          key={banner.id}
          style={{
            backgroundImage: `url("${banner.imageUrl}")`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            height: "100%",
            width: "100%",
            borderRadius: 12, // Bo góc
            boxShadow: "0 4px 15px rgba(0,0,0,0.15)", // Đổ bóng
            transition: "transform 0.3s ease, box-shadow 0.3s ease", // Hiệu ứng mượt
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.01)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
          }}
        ></div>
      ))}
    </div>
  );
};

export default BannerStatic;
