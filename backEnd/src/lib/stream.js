import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("❌ Stream API Key or Secret is missing!");
}

const StreamClient = StreamChat.getInstance(apiKey, apiSecret);

// ✅ FIXED: Remove the array brackets
export const upsertStreamUser = async (userData) => {
  try {
    if (!userData.id) {
      throw new Error("User ID is missing in userData!");
    }

    // ✅ CORRECT: Pass userData directly, not as array
    await StreamClient.upsertUser(userData);

    console.log(`✅ Stream user upserted: ${userData.name}`);
    return userData;
  } catch (error) {
    console.error("❌ Error upserting Stream user:", error);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return StreamClient.createToken(userIdStr);
  } catch (error) {
    console.error("❌ Error generating Stream token:", error);
    throw error;
  }
  
};
