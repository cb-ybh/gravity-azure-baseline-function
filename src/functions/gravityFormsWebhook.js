const { app } = require("@azure/functions");

const FORM_FIELDS = Object.freeze({
  FIRST_NAME: "first_name",
  LAST_NAME: "last_name",
  EMAIL: "email",
  SCHOOL_NAME: "school_name",
  NUMBER_OF_CHILDREN: "number_of_children",
  ENTRY_DATE: "entry_date",
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
            contact: contactData.parentName,
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
    // Gravity Forms typically sends data with numbered field keys
    let firstName = "";
    let lastName = "";
    let email = "";
    let schoolName = "";
    let numberOfChildren = 0;
    let entry_date = "";

    firstName = formData[FORM_FIELDS.FIRST_NAME] || "";
    lastName = formData[FORM_FIELDS.LAST_NAME] || "";
    email = formData[FORM_FIELDS.EMAIL];
    schoolName = formData[FORM_FIELDS.SCHOOL_NAME] || "";
    numberOfChildren = parseInt(formData[FORM_FIELDS.NUMBER_OF_CHILDREN]) || 0;
    entry_date = formData[FORM_FIELDS.ENTRY_DATE]
      ? toAdelaideTime(formData[FORM_FIELDS.ENTRY_DATE])
      : toAdelaideTime(new Date().toISOString());

    // Validate required fields
    if (!email) {
      context.log("❌ Validation failed - missing email");
      context.log("Email provided:", !!email);
      return null;
    }

    const contactName = `${firstName} ${lastName}`.trim();

    const result = {
      parentName: contactName,
      email: email.toLowerCase().trim(),
      schoolName: schoolName.trim(),
      numberOfChildren: numberOfChildren,
      submissionDate: entry_date,
      status: "New",
      source: "School Partnership",
    };

    context.log("✅ Contact data extracted successfully");
    return result;
  } catch (error) {
    context.log("❌ Error extracting contact data:", error);
    return null;
  }
}

function toAdelaideTime(dateString) {
  return new Date(dateString + " UTC").toLocaleString("en-AU", {
    timeZone: "Australia/Adelaide",
    hour12: false,
  });
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

    // Create the list item
    const listItem = {
      fields: {
        Title: contactData.parentName,
        ParentName: contactData.parentName,
        Email: contactData.email,
        SchoolName: contactData.schoolName,
        NumberofChildren: contactData.numberOfChildren,
        Status: contactData.status,
        SubmissionDate: contactData.submissionDate,
      },
    };

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
