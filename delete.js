const mongoose = require("mongoose");
const User = require("./models/User"); // Adjust path if needed

const MONGO_URI = "mongodb://localhost:27017/5oka"; // Change database name if necessary

const deleteUserByEmail = async (email) => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const result = await User.findOneAndDelete({ email });

    if (result) {
      console.log(`User with email ${email} deleted successfully.`);
    } else {
      console.log(`User with email ${email} not found.`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error deleting user:", error);
    mongoose.disconnect();
  }
};

// Replace with the email you want to delete
const emailToDelete = "Info@5oakgames.com";
deleteUserByEmail(emailToDelete);