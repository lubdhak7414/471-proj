import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getDiagnosis = async (req, res) => {
    // Move this to the top!
    const jsonPromptPart = `Please provide:
1. **Likely Diagnosis**: What the problem most likely is
2. **Estimated Cost Range**: Provide a realistic cost range in USD
3. **Urgency Level**: low, medium, high, or emergency
4. **Required Tools/Parts**: List what might be needed
5. **Difficulty Level**: DIY, Professional Required, or Specialist Required
6. **Estimated Time**: How long the repair might take
7. **Safety Concerns**: Any potential safety issues
8. **Preventive Tips**: How to avoid this issue in the future

Format your response as a JSON object with these exact keys: diagnosis, estimatedCost, urgency, requiredItems, difficulty, estimatedTime, safetyConcerns, preventiveTips.

Keep the tone professional but friendly, and be specific about costs and timeframes.`;

    try {
        console.log('Incoming Request:', req.body);
        const { description, images } = req.body;

        if (!description && (!images || images.length === 0)) {
            console.warn('Validation failed: No description or images provided');
            return res.status(400).json({ 
                message: "Please provide either a description or images for diagnosis" 
            });
        }

        let model;
        let contents;
        
        // Dynamically select the model based on input type
        if (images && images.length > 0) {
            // Use gemini-1.5-pro for its superior multimodal capabilities
            // gemini-pro-vision is also an option but gemini-1.5-pro is the latest
            model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); 
            console.log('Using multimodal model: gemini-1.5-pro');

            // Build parts array: first part is text, then images
            const parts = [
                { text: `You are an expert repair technician with years of experience across multiple domains (electronics, appliances, plumbing, electrical, automotive, etc.). Based on the following information, provide a detailed repair diagnosis. Description: ${description}` },
                ...images.map(image => ({
                    inline_data: {
                        data: image.split(',')[1],
                        mime_type: "image/jpeg"
                    }
                }))
            ];

            // Add JSON formatting instructions as another text part
            parts.push({ text: jsonPromptPart });

            contents = [
                {
                    role: "user",
                    parts: parts
                }
            ];
        } else {
            // Use gemini-pro for text-only requests
            model = genAI.getGenerativeModel({ model: "gemini-pro" });
            console.log('Using text-only model: gemini-pro');

            contents = [
                {
                    role: "user",
                    parts: [
                        { text: `You are an expert repair technician with years of experience across multiple domains (electronics, appliances, plumbing, electrical, automotive, etc.). Based on the following information, provide a detailed repair diagnosis. Description: ${description}\n${jsonPromptPart}` }
                    ]
                }
            ];
        }

        const result = await model.generateContent({ contents: contents });

        if (!result || !result.response || !result.response.text) {
            throw new Error("Invalid response from AI model");
        }

        const response = result.response;
        const text = response.text();

        let diagnosis;
        try {
            // The model's response might include Markdown around the JSON
            const jsonString = text.replace(/```json\s*|```\s*/g, '');
            diagnosis = JSON.parse(jsonString);
        } catch (parseError) {
            console.error('Error parsing response as JSON:', parseError);
            console.log('Raw response text:', text);
            
            diagnosis = {
                diagnosis: text,
                estimatedCost: "Contact technician for quote",
                urgency: "medium",
                requiredItems: "To be determined",
                difficulty: "Professional Required",
                estimatedTime: "1-3 hours",
                safetyConcerns: "Follow standard safety precautions",
                preventiveTips: "Regular maintenance recommended"
            };
        }

        res.status(200).json({
            message: "Diagnosis generated successfully",
            diagnosis
        });

    } catch (error) {
        console.error("AI Diagnosis Error:", error);
        res.status(500).json({ 
            message: "Failed to generate diagnosis. Please try again." 
        });
    }
};