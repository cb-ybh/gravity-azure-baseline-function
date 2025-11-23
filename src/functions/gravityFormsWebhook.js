const { app } = require("@azure/functions");

// Gravity Forms field IDs based on actual form structure
const FORM_FIELDS = Object.freeze({
  // Common fields (all registration types)
  REG_TYPE: "17",
  FIRST_NAME: "6.3",
  LAST_NAME: "6.6",
  EMAIL: "3",
  PHONE: "18",
  ADDITIONAL_NOTES: "27",
  FORM_IDENTIFIER: "14",

  // Parent/Guardian specific
  SCHOOL_NAME: "7",
  NUMBER_OF_CHILDREN: "16",

  // Player specific
  PLAYER_CLUB_NAME: "22",

  // Club representative specific
  CLUB_NAME: "24",
  CLUB_SPORT_TYPE: "25",
  CLUB_NUMBER_OF_PLAYERS: "26",
});

app.http("gravityFormsWebhook", {
  methods: ["GET", "POST"],
  authLevel: "function",
  route: "webhook",
  handler: async (request, context) => {
    context.log("🚀 Gravity Forms webhook received");
    context.log("Request method:", request.method);
    context.log(
      "Request headers:",
      JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2)
    );

    // Handle GET requests (for testing)
    if (request.method === "GET") {
      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "YBH Baseline Screening Webhook is running!",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        }),
      };
    }

    try {
      // Parse the request body for POST requests
      const requestBody = await request.text();
      context.log("Raw request body length:", requestBody.length);

      if (!requestBody) {
        context.log("Empty request body received");
        return {
          status: 400,
          body: JSON.stringify({ error: "Empty request body" }),
        };
      }

      let formData;

      // Handle different content types
      const contentType = request.headers.get("content-type") || "";
      context.log("Content-Type:", contentType);

      if (contentType.includes("application/json")) {
        try {
          formData = JSON.parse(requestBody);
        } catch (e) {
          context.log("Failed to parse JSON:", e.message);
          return {
            status: 400,
            body: JSON.stringify({ error: "Invalid JSON format" }),
          };
        }
      } else {
        // Parse URL-encoded form data
        formData = parseFormData(requestBody);
      }

      context.log("Parsed form data:", JSON.stringify(formData, null, 2));

      // Extract form fields based on Gravity Forms structure
      const contactData = extractContactData(formData, context);

      if (!contactData) {
        context.log("Invalid form data - could not extract contact data");
        return {
          status: 400,
          body: JSON.stringify({
            error: "Invalid form data - missing required fields",
          }),
        };
      }

      context.log(
        "Extracted contact data:",
        JSON.stringify(contactData, null, 2)
      );

      // Add contact to Microsoft Lists
      const result = await addToSharePointList(contactData, context);

      if (result.success) {
        context.log(
          "✅ Successfully added contact to SharePoint list, item ID:",
          result.itemId
        );
        return {
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: true,
            message: "Contact added successfully",
            itemId: result.itemId,
            contact: contactData.contactName,
            registrationType: contactData.registrationType,
          }),
        };
      } else {
        context.log(
          "❌ Failed to add contact to SharePoint list:",
          result.error
        );
        return {
          status: 500,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: "Failed to add contact to SharePoint list",
            details: result.error,
          }),
        };
      }
    } catch (error) {
      context.log("❌ Error processing webhook:", error);
      return {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: "Internal server error",
          details: error.message,
        }),
      };
    }
  },
});

function parseFormData(body) {
  const params = new URLSearchParams(body);
  const data = {};
  for (const [key, value] of params) {
    data[key] = value;
  }
  return data;
}

function extractContactData(formData, context) {
  try {
    // Extract common fields
    const regType = formData[FORM_FIELDS.REG_TYPE] || "";
    const firstName = formData[FORM_FIELDS.FIRST_NAME] || "";
    const lastName = formData[FORM_FIELDS.LAST_NAME] || "";
    const email = formData[FORM_FIELDS.EMAIL];
    const phone = formData[FORM_FIELDS.PHONE] || "";
    const additionalNotes = formData[FORM_FIELDS.ADDITIONAL_NOTES] || "";
    const submissionDate = toAdelaideTime(new Date().toISOString());

    // Validate required fields
    if (!email) {
      context.log("❌ Validation failed - missing email");
      return null;
    }

    if (!regType) {
      context.log("❌ Validation failed - missing registration type");
      return null;
    }

    const contactName = `${firstName} ${lastName}`.trim();

    // Build base contact object
    // Capitalize registration type to match SharePoint Choice field values (Parent/Player/Club)
    const registrationTypeCapitalized = regType.charAt(0).toUpperCase() + regType.slice(1).toLowerCase();

    const result = {
      registrationType: registrationTypeCapitalized,
      contactName: contactName,
      firstName: firstName,
      lastName: lastName,
      email: email.toLowerCase().trim(),
      phone: phone,
      additionalNotes: additionalNotes,
      submissionDate: submissionDate,
      status: "New",
    };

    // Add type-specific fields
    if (regType === "parent") {
      result.schoolName = formData[FORM_FIELDS.SCHOOL_NAME] || "";
      result.numberOfChildren = parseInt(formData[FORM_FIELDS.NUMBER_OF_CHILDREN]) || 0;
    } else if (regType === "player") {
      result.playerClubName = formData[FORM_FIELDS.PLAYER_CLUB_NAME] || "";
    } else if (regType === "club") {
      result.clubName = formData[FORM_FIELDS.CLUB_NAME] || "";
      result.clubSportType = formData[FORM_FIELDS.CLUB_SPORT_TYPE] || "";
      result.clubNumberOfPlayers = parseInt(formData[FORM_FIELDS.CLUB_NUMBER_OF_PLAYERS]) || 0;
    }

    context.log("✅ Contact data extracted successfully");
    context.log("Registration type:", regType);
    return result;
  } catch (error) {
    context.log("❌ Error extracting contact data:", error);
    return null;
  }
}

function toAdelaideTime(dateString) {
  // Convert to Adelaide timezone and return ISO format for SharePoint
  const date = new Date(dateString);

  // Format as ISO string in Adelaide timezone
  const adelaideDate = new Date(date.toLocaleString("en-US", {
    timeZone: "Australia/Adelaide",
  }));

  return adelaideDate.toISOString();
}

async function addToSharePointList(contactData, context) {
  try {
    context.log("🔗 Starting SharePoint integration...");

    const { DefaultAzureCredential } = require("@azure/identity");
    const axios = require("axios");

    // Get access token using Managed Identity
    context.log("Getting access token with Managed Identity...");
    const credential = new DefaultAzureCredential();
    const scope = "https://graph.microsoft.com/.default";

    const tokenResponse = await credential.getToken(scope);
    const accessToken = tokenResponse.token;
    context.log("✅ Access token obtained");

    // SharePoint configuration
    const siteUrl =
      process.env.SHAREPOINT_SITE_URL ||
      "https://ybhuk.sharepoint.com/sites/YourBrainHealth";
    const listName = process.env.LIST_NAME || "Baseline Screening Contacts";

    // Parse site URL for Graph API
    const siteDomain = siteUrl.replace("https://", "").split("/")[0];
    const sitePathParts = siteUrl.replace("https://", "").split("/").slice(1);
    const sitePath = "/" + sitePathParts.join("/");

    context.log("Site domain:", siteDomain);
    context.log("Site path:", sitePath);

    // Get SharePoint site ID
    context.log("Getting SharePoint site ID...");
    const siteApiUrl = `https://graph.microsoft.com/v1.0/sites/${siteDomain}:${sitePath}`;
    context.log("Site API URL:", siteApiUrl);

    const siteResponse = await axios.get(siteApiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const siteId = siteResponse.data.id;
    context.log("✅ Site ID obtained:", siteId);

    // Get the list
    context.log("Getting SharePoint list...");
    const listsResponse = await axios.get(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const targetList = listsResponse.data.value.find(
      (list) => list.displayName === listName || list.name === listName
    );

    if (!targetList) {
      throw new Error(
        `List '${listName}' not found. Available lists: ${listsResponse.data.value
          .map((l) => l.displayName)
          .join(", ")}`
      );
    }

    context.log(
      "✅ Found target list:",
      targetList.displayName,
      "ID:",
      targetList.id
    );

    // Create the list item - map to SharePoint StaticName fields
    const listItem = {
      fields: {
        Title: contactData.contactName || contactData.email,
        RegistrationType: contactData.registrationType,
        ParentName: contactData.contactName,
        Email: contactData.email,
        Phone: contactData.phone,
        Notes: contactData.additionalNotes,
        Status: contactData.status,
        SubmissionDate: contactData.submissionDate,
      },
    };

    // Map type-specific fields to shared columns (using SharePoint StaticName)
    // Note: registrationType is capitalized (Parent/Player/Club)
    if (contactData.registrationType === "Parent") {
      listItem.fields.SchoolName = contactData.schoolName || "";
      listItem.fields.NumberofChildren = contactData.numberOfChildren || 0;
    } else if (contactData.registrationType === "Player") {
      listItem.fields.SchoolName = contactData.playerClubName || "";
      listItem.fields.NumberofChildren = 1; // Default to 1 for individual players
    } else if (contactData.registrationType === "Club") {
      listItem.fields.SchoolName = contactData.clubName || "";
      listItem.fields.NumberofChildren = contactData.clubNumberOfPlayers || 0;
      listItem.fields.SportType = contactData.clubSportType || "";
    }

    context.log(
      "Creating list item with data:",
      JSON.stringify(listItem, null, 2)
    );

    const createResponse = await axios.post(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${targetList.id}/items`,
      listItem,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    context.log(
      "✅ Successfully created list item with ID:",
      createResponse.data.id
    );

    return {
      success: true,
      itemId: createResponse.data.id,
    };
  } catch (error) {
    context.log("❌ SharePoint integration error:", error.message);
    if (error.response) {
      context.log("HTTP Status:", error.response.status);
      context.log(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}
