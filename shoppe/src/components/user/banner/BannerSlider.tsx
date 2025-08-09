import React, { useEffect, useState } from 'react';
import { Carousel, message, Spin } from 'antd';
import { getBannerByType } from '../../../api/banner/banner.api';

interface BannerSliderProps {
    bannerType: string; // Ví dụ: 'homepage', 'product', 'sale'
}

const BannerSlider = ({ bannerType }: BannerSliderProps) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchBanner = async () => {
        setLoading(true);
        try {
            const res: any = await getBannerByType(bannerType.toLowerCase());
            if (res.success) {
                setData(res.data || []);
            } else {
                message.error('Không thể lấy danh sách banner');
            }
        } catch (error) {
            console.error(error);
            message.error('Đã xảy ra lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanner();
    }, [bannerType]); // <- Gọi lại khi bannerType thay đổi

    return (
        <Spin spinning={loading} tip="Đang tải banner...">
            <Carousel autoplay className="w-full">
                {data.map((banner: any) => (
                    <div key={banner.id} className="flex justify-center items-center bg-white">
                        <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}

                        />
                    </div>
                ))}
            </Carousel>
        </Spin>
    );
};

export default BannerSlider;
