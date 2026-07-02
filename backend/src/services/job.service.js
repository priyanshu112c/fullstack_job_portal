import Job from "../models/Job.js"

export const createJobsService = async (data) => {
    return Job.create(data)
}
export const getAllJobsService = async (
    filter,
    skip,
    limit
) => {
    return await Job.find(filter)
        .lean()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
};
// export const getAllJobsService= async (query)=>{
//     const {keyword, location, experience, page=1, limit=10} = query;

//     const filters = {};
//     if(keyword){
//         filters.title = {
//             $regex:keyword,
//             $options:"i"
//         }
//     }

//     if(location){
//         filters.location = {
//             $regex:location,
//             $options:"i"
//         }
//     }

//     if(experience){
//         filters.experience=experience;
//     }
//     const skip = (page-1)*limit;

//     const jobs= await Job.find(filters).skip(skip).limit(Number(limit)).sort({
//         createdAt:-1
//     })

//     const total = await Job.countDocuments(filters);
//     return {
//         jobs,
//         total
//     }
// }

export const getJobsByIdService = async (id) => {
    return await Job.findById(id)

};

export const updateJobsService = async (id, data) => {
    return await Job.findByIdAndUpdate(id, data, { new: true })
}

export const deleteJobsService = async (id) => {
    return await Job.findByIdAndDelete(id)
}