import mongoose from 'mongoose';

const dataSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        trim: true,
    },
    energy: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    channel1: {
        type: Boolean,
        required: true,
    },
    channel2: {
        type: Boolean,
        required: true,
    },
    channel3: {
        type: Boolean,
        required: true,
    },
    channel4: {
        type: Boolean,
        required: true,
    },
}, { timestamps: true }); 

// Exporting the model created from the schema
export default mongoose.model('data', dataSchema);
