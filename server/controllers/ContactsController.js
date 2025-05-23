import User from "../models/UserModel.js";

export const searchContacts = async (req, res, next) => {
  try {
    const { searchTerm } = req.body;
    if (searchTerm === undefined || searchTerm === null) {
      return res.status(400).json({ message: "Please provide a search term" });
    }

    // Escape special characters in searchTerm to safely use in regex
    // This prevents regex injection or errors
    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[/]\\]/g,
      "\\$&"
    );

    // Create a case-insensitive regular expression for the searchTerm
    const regex = new RegExp(sanitizedSearchTerm, "i");

    // Query the User collection to find contacts that:
    // - Are NOT the currently authenticated user (exclude by _id)
    // - Match the regex in either firstName, lastName, or email fields
    const contacts = await User.find({
      $and: [
        // Exclude the currently authenticated user from the search results
        { _id: { $ne: req.user.userId } },

        // Match documents where any of the following fields contain the search term (case-insensitive)
        {
          $or: [
            { firstName: regex }, // firstName matches the regex
            { lastName: regex }, // lastName matches the regex
            { email: regex }, // email matches the regex
          ],
        },
      ],
    });

    return res.status(200).json({ contacts });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: error.message });
  }
};
