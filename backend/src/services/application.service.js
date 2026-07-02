import Application from "../models/Application.js";
export const applyJobService = async(userId, jobId, resumeUrl)=>{
    return await Application.create({
        applicant:userId,
        job:jobId,
        resumeUrl: resumeUrl || ""
    })
}

export const getMyApplicationsService = async(userId)=>{
    return await Application.find({
        applicant:userId,
    }).populate("job")
}

export const deleteApplicationService = async(applicationId, userId)=>{
    const application = await Application.findOne({
        _id: applicationId,
        applicant: userId,
    })
    if(!application){
        return null
    }
    await Application.deleteOne({ _id: applicationId })
    return application
}