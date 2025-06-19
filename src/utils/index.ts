  // cloudinaryUpload.ts
export interface CloudinaryResponse {
  secure_url: string;
  // Add other properties if needed
}

export const uploadBase64File = async (
  fullBase64Data: string,
  setLoading?: (val: boolean) => void
): Promise<string | null> => {
  if (setLoading) setLoading(true);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dizxfdmk5/upload`, // use auto resource_type
      {
        method: 'POST',
        body: JSON.stringify({
          file: fullBase64Data, // Already includes "data:application/pdf;base64,..."
          upload_preset: 'ml_default',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const file: CloudinaryResponse = await res.json();
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
      const result = reader.result as string; // Includes full "data:<mime>;base64,..."
      resolve(result);
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

