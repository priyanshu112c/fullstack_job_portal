import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (
    buffer,
    options = {}
) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const stream =
                cloudinary.uploader.upload_stream(
                    {
                        folder: options.folder || "resumes",
                        resource_type: options.resourceType || "raw"
                    },

                    (
                        error,
                        result
                    ) => {

                        if (error)
                            reject(
                                error
                            );

                        resolve(
                            result
                        );
                    }
                );

            stream.end(buffer);
        }
    );
};

export default uploadToCloudinary;