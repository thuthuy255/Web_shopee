// src/utils/uploadImage.ts

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "productShopee");
    formData.append("cloud_name", "dxnzqshf7");

    try {
        const res = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        if (res.ok) {
            return data.secure_url; // ✅ URL ảnh
        } else {
            throw new Error(data.error?.message || "Upload failed");
        }
    } catch (error) {
        console.error("❌ Upload error:", error);
        throw error;
    }
};
