import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
    {
        deviceId: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        totalEnergy: {
            type: Number,
            required: true,
        },
        currentChannel1: {
            type: Boolean,
            required: true,
        },
        currentChannel2: {
            type: Boolean,
            required: true,
        },
        currentChannel3: {
            type: Boolean,
            required: true,
        },
        currentChannel4: {
            type: Boolean,
            required: true,
        },
        isPico: {
            type: Boolean,
            required: true,
            default: false,
        },
        isActive: {
            type: Boolean,
            required: true,
        },
        pirValue: {
            type: Boolean,
            required: true,
            default: false,
        },
        pirLastChanged: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Exporting the model created from the schema
export default mongoose.model("device", deviceSchema);
