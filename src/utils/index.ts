  // cloudinaryUpload.ts
export interface CloudinaryResponse {
  secure_url: string;
  // Add other properties if needed
}

export const uploadBase64File = async (
  base64Data: string,
  type: string,
  setLoading?: (val: boolean) => void
): Promise<string | null> => {
  if (setLoading) setLoading(true);

  try {
    // Strip data URL prefix
    const base64 = base64Data.split(',')[1]; // Get only the base64 part

    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64}`); // Set mime-type accordingly
    formData.append('upload_preset', 'visitor-management-system');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dizxfdmk5/${type}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const file: CloudinaryResponse = await res.json();

    if (!res.ok) {
      console.error('Cloudinary response error:', file);
      return null;
    }

    return file.secure_url;
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    return null;
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const convertFileToBase64 = (
  file: File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result); // ✅ Return the full "data:...;base64,..." string
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
