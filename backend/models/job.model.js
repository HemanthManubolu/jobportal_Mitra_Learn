import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: [{
        type: String
    }],
    salary: {
        type: Number,
        required: true,
        min: 0
    },
    experienceLevel:{
        type:String,
        default:"Entry",
    },
    location: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
        }
    ],
    workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'On-site' },
    employmentType: { type: String, default: 'Full-time' },
    skills: [{ type: String, trim: true }],
    benefits: [{ type: String, trim: true }],
    deadline: { type: Date },
    status: { type: String, enum: ['active', 'closed', 'expired'], default: 'active', index: true },
    source: { type: String, trim: true },
    sourceUrl: { type: String, trim: true },
    // Stored on aggregated jobs as well as on their Company document so job cards
    // retain the Remotive logo even when older company records have no logo.
    companyLogo: { type: String, trim: true },
    postedDate: { type: Date },
    // Kept separate from `source` so manually-created and feed jobs are explicit.
    isAggregated: { type: Boolean, default: false, index: true }
},{timestamps:true});
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ company: 1, createdAt: -1 });
jobSchema.index({ location: 1, createdAt: -1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ workMode: 1, employmentType: 1, createdAt: -1 });
jobSchema.index({ deadline: 1, status: 1 });
jobSchema.index({ source: 1, sourceUrl: 1 }, { unique: true, sparse: true });
export const Job = mongoose.model("Job", jobSchema);
