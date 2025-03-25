"use strict";

const https = require('https');
const { PassThrough } = require('stream');

// ----------------------------
// Tool Definitions Section (Optimized for AI Agent)
// ----------------------------

const tools = [];
const toolMap = {};

// Helper function to add a tool definition
const addTool = (name, method, path, description, inputSchema) => {
  // Each tool definition includes a name, a clear description, and a JSON schema for inputs.
  tools.push({ name, description, inputSchema });
  toolMap[name] = { method, path, description, inputSchema };
};

// People (Contacts) endpoints
addTool(
  "list_people",
  "GET",
  "/people",
  "Retrieve all contacts from the CRM. Use this tool to get an overview of every lead and client; supports pagination and filtering.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_person",
  "POST",
  "/people",
  "Add a new contact to the CRM. Provide the contact's details such as firstName, lastName, email, and phone. Use this tool when a new lead arrives.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "An object containing the new contact's details (firstName, lastName, email, phone, etc.)"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_person",
  "GET",
  "/people/:id",
  "Fetch detailed information about a specific contact using its ID. Use this tool when you need complete data for a lead.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Unique identifier for the contact" } },
    required: ["id"]
  }
);
addTool(
  "update_person",
  "PUT",
  "/people/:id",
  "Modify an existing contact's information. Supply the contact ID along with the fields you wish to update (e.g., email or phone).",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Contact ID" },
      data: { type: "object", description: "Fields to update (e.g., updated email or phone number)" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_person",
  "DELETE",
  "/people/:id",
  "Remove a contact from the CRM using its ID. Use this tool when a lead is no longer valid.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Contact ID" } },
    required: ["id"]
  }
);
addTool(
  "check_duplicate_person",
  "GET",
  "/people/checkDuplicate",
  "Verify if a contact already exists by checking an email or phone. Use this tool before creating a new contact.",
  {
    type: "object",
    properties: {
      email: { type: "string", description: "Email address to check (optional)" },
      phone: { type: "string", description: "Phone number to check (optional)" }
    },
    required: []
  }
);
addTool(
  "list_unclaimed_people",
  "GET",
  "/people/unclaimed",
  "Get a list of unclaimed leads. Use this tool to see all contacts that haven't been assigned to an agent.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "claim_person",
  "POST",
  "/people/claim",
  "Claim an unassigned lead by providing the contact ID. Use this tool to assign a lead to yourself.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "ID of the contact to claim" } },
    required: ["id"]
  }
);
addTool(
  "ignore_person",
  "POST",
  "/people/ignoreUnclaimed",
  "Mark an unassigned lead as ignored by supplying the contact ID. Use this tool when a lead is not of interest.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "ID of the contact to ignore" } },
    required: ["id"]
  }
);
addTool(
  "add_person_attachment",
  "POST",
  "/personAttachments",
  "Attach a file or document to a contact's record. Use this tool when you need to store additional documentation; requires registered system credentials.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Attachment details (e.g., filename, base64 content, associated contact ID)"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_person_attachment",
  "GET",
  "/personAttachments/:id",
  "Retrieve information about a specific attachment using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Attachment ID" } },
    required: ["id"]
  }
);
addTool(
  "update_person_attachment",
  "PUT",
  "/personAttachments/:id",
  "Update details for a contact's attachment (for example, rename the file).",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Attachment ID" },
      data: { type: "object", description: "Updated attachment fields" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_person_attachment",
  "DELETE",
  "/personAttachments/:id",
  "Remove an attachment from a contact's record using the attachment ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Attachment ID" } },
    required: ["id"]
  }
);

// People Relationships endpoints
addTool(
  "list_relationships",
  "GET",
  "/peopleRelationships",
  "Retrieve all relationships between contacts (e.g., referrals, family links). Use this tool to see how contacts are connected.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_relationship",
  "POST",
  "/peopleRelationships",
  "Create a new relationship between two contacts. Use this tool to link contacts (e.g., set a spouse or referral relationship).",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Relationship details, including both contact IDs and the relationship type"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_relationship",
  "GET",
  "/peopleRelationships/:id",
  "Fetch details of a specific relationship using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Relationship ID" } },
    required: ["id"]
  }
);
addTool(
  "update_relationship",
  "PUT",
  "/peopleRelationships/:id",
  "Modify an existing relationship. Use this tool to update the relationship type or linked contacts.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Relationship ID" },
      data: { type: "object", description: "Updated relationship fields" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_relationship",
  "DELETE",
  "/peopleRelationships/:id",
  "Remove a relationship between contacts using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Relationship ID" } },
    required: ["id"]
  }
);

// Identity endpoint
addTool(
  "get_identity",
  "GET",
  "/identity",
  "Retrieve details about the current API user. Use this tool to confirm your authenticated identity in Follow Up Boss.",
  { type: "object", properties: {}, required: [] }
);

// Notes endpoints
addTool(
  "create_note",
  "POST",
  "/notes",
  "Add an internal note to a contact’s timeline. Use this tool to log important interactions or follow-ups.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Note details, including text content and the associated contact ID"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_note",
  "GET",
  "/notes/:id",
  "Retrieve a specific note using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Note ID" } },
    required: ["id"]
  }
);
addTool(
  "update_note",
  "PUT",
  "/notes/:id",
  "Update the content of an existing note. Use this tool when the note information changes.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Note ID" },
      data: { type: "object", description: "Updated note content" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_note",
  "DELETE",
  "/notes/:id",
  "Remove a note from a contact’s timeline using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Note ID" } },
    required: ["id"]
  }
);

// Calls endpoints
addTool(
  "list_calls",
  "GET",
  "/calls",
  "Retrieve a log of all call records. Use this tool to view phone call interactions with leads.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_call",
  "POST",
  "/calls",
  "Log a call record in the CRM. Use this tool to record details of a phone call, including outcome and duration.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Call details such as contact ID, outcome, and duration"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_call",
  "GET",
  "/calls/:id",
  "Retrieve details of a specific call record by ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Call record ID" } },
    required: ["id"]
  }
);
addTool(
  "update_call",
  "PUT",
  "/calls/:id",
  "Update a logged call record using its ID. Use this tool if call details need correction.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Call record ID" },
      data: { type: "object", description: "Updated call details" }
    },
    required: ["id", "data"]
  }
);

// Text Messages endpoints (requires registered system for creation)
addTool(
  "list_text_messages",
  "GET",
  "/textMessages",
  "Retrieve a log of all text message communications recorded in the CRM.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_text_message",
  "POST",
  "/textMessages",
  "Record an outgoing text message in the CRM. Use this tool to log the content of a text, along with recipient details. (Note: This tool records the message but does not send an SMS; it requires registered system credentials.)",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Text message details including message content and the recipient's contact ID"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_text_message",
  "GET",
  "/textMessages/:id",
  "Fetch details of a specific text message log using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Text message log ID" } },
    required: ["id"]
  }
);

// Users endpoints
addTool(
  "list_users",
  "GET",
  "/users",
  "Retrieve a list of all users (agents/staff) in the CRM.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "get_user",
  "GET",
  "/users/:id",
  "Fetch detailed information for a specific user by ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "User ID" } },
    required: ["id"]
  }
);
addTool(
  "delete_user",
  "DELETE",
  "/users/:id",
  "Remove a user from the CRM using their ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "User ID" } },
    required: ["id"]
  }
);
addTool(
  "get_current_user",
  "GET",
  "/me",
  "Retrieve details of the currently authenticated user (your profile).",
  { type: "object", properties: {}, required: [] }
);

// Smart Lists endpoints
addTool(
  "list_smart_lists",
  "GET",
  "/smartLists",
  "List all saved filters (Smart Lists) that help segment contacts in the CRM.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "get_smart_list",
  "GET",
  "/smartLists/:id",
  "Retrieve detailed information for a specific Smart List using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Smart List ID" } },
    required: ["id"]
  }
);

// Action Plans endpoints
addTool(
  "list_action_plans",
  "GET",
  "/actionPlans",
  "Retrieve all Action Plans (drip campaigns or follow-up sequences).",
  { type: "object", properties: {}, required: [] }
);

// Action Plans People endpoints
addTool(
  "list_action_plans_people",
  "GET",
  "/actionPlansPeople",
  "List all enrollments in Action Plans. Use this tool to see which contacts are in a follow-up sequence.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_action_plans_people",
  "POST",
  "/actionPlansPeople",
  "Enroll a contact into an Action Plan. Provide the contact ID and the action plan ID to start the campaign.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Enrollment details including personId and actionPlanId"
      }
    },
    required: ["data"]
  }
);
addTool(
  "update_action_plans_people",
  "PUT",
  "/actionPlansPeople/:id",
  "Update an enrollment in an Action Plan (e.g., change the stage or mark as completed) using the enrollment ID.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Enrollment ID" },
      data: { type: "object", description: "Fields to update for the enrollment" }
    },
    required: ["id", "data"]
  }
);

// Email Templates endpoints
addTool(
  "list_email_templates",
  "GET",
  "/templates",
  "Retrieve a list of all email templates available in the CRM.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_email_template",
  "POST",
  "/templates",
  "Add a new email template. Use this tool to design and save reusable email content.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Template details including name, subject, and content"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_email_template",
  "GET",
  "/templates/:id",
  "Fetch the details of a specific email template using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Template ID" } },
    required: ["id"]
  }
);
addTool(
  "update_email_template",
  "PUT",
  "/templates/:id",
  "Modify an existing email template. Use this tool to update content, subject, or other fields.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Template ID" },
      data: { type: "object", description: "Updated template fields" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "merge_email_template",
  "POST",
  "/templates/merge",
  "Merge an email template with dynamic data to generate the final email content. Use this tool when you need a customized email message based on a template.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Merge context including templateId and merge fields"
      }
    },
    required: ["data"]
  }
);
addTool(
  "delete_email_template",
  "DELETE",
  "/templates/:id",
  "Remove an email template from the CRM using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Template ID" } },
    required: ["id"]
  }
);

// Text Message Templates endpoints
addTool(
  "list_text_message_templates",
  "GET",
  "/textMessageTemplates",
  "Retrieve all text message templates saved in the CRM.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_text_message_template",
  "POST",
  "/textMessageTemplates",
  "Add a new text message template. Use this tool to save common SMS messages for reuse.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Template details such as name and content"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_text_message_template",
  "GET",
  "/textMessageTemplates/:id",
  "Fetch details of a specific text message template by ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Template ID" } },
    required: ["id"]
  }
);
addTool(
  "update_text_message_template",
  "PUT",
  "/textMessageTemplates/:id",
  "Modify an existing text message template. Use this tool to change the template's content or name.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Template ID" },
      data: { type: "object", description: "Updated template fields" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "merge_text_message_template",
  "POST",
  "/textMessageTemplates/merge",
  "Merge a text message template with provided data to generate a finalized SMS message. Use this tool when you need dynamic SMS content.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Merge context including templateId and dynamic fields"
      }
    },
    required: ["data"]
  }
);
addTool(
  "delete_text_message_template",
  "DELETE",
  "/textMessageTemplates/:id",
  "Delete a text message template from the CRM using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Template ID" } },
    required: ["id"]
  }
);

// Email Marketing endpoints
addTool(
  "list_email_events",
  "GET",
  "/emEvents",
  "List email marketing events such as opens and clicks. Use this tool to track campaign performance.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_email_event",
  "POST",
  "/emEvents",
  "Log an email marketing event (e.g., open, click). Use this tool to record campaign engagement.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Details about the email event (campaign ID, event type, timestamp, etc.)"
      }
    },
    required: ["data"]
  }
);
addTool(
  "list_email_campaigns",
  "GET",
  "/emCampaigns",
  "Retrieve all email marketing campaigns. Use this tool to review your batch email send definitions.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_email_campaign",
  "POST",
  "/emCampaigns",
  "Start a new email marketing campaign. Provide campaign details such as name, audience, and content.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Campaign details for a bulk email send"
      }
    },
    required: ["data"]
  }
);
addTool(
  "update_email_campaign",
  "PUT",
  "/emCampaigns/:id",
  "Update an ongoing email campaign by ID. Use this tool to change content, schedule, or other campaign settings.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Campaign ID" },
      data: { type: "object", description: "Fields to update for the campaign" }
    },
    required: ["id", "data"]
  }
);

// Custom Fields endpoints
addTool(
  "list_custom_fields",
  "GET",
  "/customFields",
  "Retrieve all custom field definitions. Use this tool to view custom metadata set up in your CRM.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_custom_field",
  "POST",
  "/customFields",
  "Create a new custom field definition. Use this tool to add a new field to contact records.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Definition details for the custom field (name, type, etc.)"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_custom_field",
  "GET",
  "/customFields/:id",
  "Fetch the definition of a specific custom field by ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Custom field ID" } },
    required: ["id"]
  }
);
addTool(
  "update_custom_field",
  "PUT",
  "/customFields/:id",
  "Update a custom field definition. Use this tool to modify custom field properties.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Custom field ID" },
      data: { type: "object", description: "Updated custom field details" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_custom_field",
  "DELETE",
  "/customFields/:id",
  "Remove a custom field definition from the CRM.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Custom field ID" } },
    required: ["id"]
  }
);

// Stages endpoints (contact stages)
addTool(
  "list_stages",
  "GET",
  "/stages",
  "Retrieve all lead stages or statuses (e.g., New Lead, Qualified, Closed). Use this tool to see how contacts are segmented.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_stage",
  "POST",
  "/stages",
  "Create a new lead stage. Use this tool to add a new status to your CRM workflow.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Stage details (e.g., name, color, order)"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_stage",
  "GET",
  "/stages/:id",
  "Fetch details of a specific stage by its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Stage ID" } },
    required: ["id"]
  }
);
addTool(
  "update_stage",
  "PUT",
  "/stages/:id",
  "Update an existing stage. Use this tool to modify a lead status, such as renaming it or changing its order.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Stage ID" },
      data: { type: "object", description: "Updated stage information" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_stage",
  "DELETE",
  "/stages/:id",
  "Remove a lead stage from the system using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Stage ID" } },
    required: ["id"]
  }
);

// Tasks endpoints
addTool(
  "list_tasks",
  "GET",
  "/tasks",
  "Retrieve all tasks (to-do items) from the CRM, including upcoming and completed tasks.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_task",
  "POST",
  "/tasks",
  "Create a new task. Use this tool to set up follow-ups or reminders for contacts.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Task details (description, due date, assigned user, and optionally a contact ID)"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_task",
  "GET",
  "/tasks/:id",
  "Fetch details of a specific task using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Task ID" } },
    required: ["id"]
  }
);
addTool(
  "update_task",
  "PUT",
  "/tasks/:id",
  "Update a task's details (e.g., mark it as complete or change its due date).",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Task ID" },
      data: { type: "object", description: "Task fields to update" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_task",
  "DELETE",
  "/tasks/:id",
  "Delete a task from the CRM using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Task ID" } },
    required: ["id"]
  }
);

// Appointments endpoints
addTool(
  "list_appointments",
  "GET",
  "/appointments",
  "Retrieve all scheduled appointments or meetings.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_appointment",
  "POST",
  "/appointments",
  "Schedule a new appointment. Provide details like title, date/time, and participants.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Appointment details (title, datetime, participant IDs, etc.)"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_appointment",
  "GET",
  "/appointments/:id",
  "Fetch details for a specific appointment using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Appointment ID" } },
    required: ["id"]
  }
);
addTool(
  "update_appointment",
  "PUT",
  "/appointments/:id",
  "Modify an appointment's details. Use this tool to reschedule or update meeting information.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Appointment ID" },
      data: { type: "object", description: "Updated appointment details" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_appointment",
  "DELETE",
  "/appointments/:id",
  "Cancel or remove an appointment using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Appointment ID" } },
    required: ["id"]
  }
);

// Appointment Types endpoints
addTool(
  "list_appointment_types",
  "GET",
  "/appointmentTypes",
  "List all available appointment types (categories of meetings).",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_appointment_type",
  "POST",
  "/appointmentTypes",
  "Create a new appointment type. Use this tool to define a category for meetings.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Details for the new appointment type (name, description, etc.)"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_appointment_type",
  "GET",
  "/appointmentTypes/:id",
  "Retrieve details of a specific appointment type using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Appointment type ID" } },
    required: ["id"]
  }
);
addTool(
  "update_appointment_type",
  "PUT",
  "/appointmentTypes/:id",
  "Update an existing appointment type. Use this tool to change properties like the name or description.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Appointment type ID" },
      data: { type: "object", description: "Updated fields for the appointment type" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_appointment_type",
  "DELETE",
  "/appointmentTypes/:id",
  "Remove an appointment type from the system using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Appointment type ID" } },
    required: ["id"]
  }
);

// Appointment Outcomes endpoints
addTool(
  "list_appointment_outcomes",
  "GET",
  "/appointmentOutcomes",
  "Retrieve all possible outcomes for appointments (e.g., Successful, No-Show).",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_appointment_outcome",
  "POST",
  "/appointmentOutcomes",
  "Define a new outcome option for appointments.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Outcome details (name, description)"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_appointment_outcome",
  "GET",
  "/appointmentOutcomes/:id",
  "Fetch details of a specific appointment outcome by ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Outcome ID" } },
    required: ["id"]
  }
);
addTool(
  "update_appointment_outcome",
  "PUT",
  "/appointmentOutcomes/:id",
  "Update an appointment outcome. Use this tool to modify outcome properties.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Outcome ID" },
      data: { type: "object", description: "Updated outcome details" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_appointment_outcome",
  "DELETE",
  "/appointmentOutcomes/:id",
  "Delete an appointment outcome option using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Outcome ID" } },
    required: ["id"]
  }
);

// Webhooks endpoints
addTool(
  "list_webhooks",
  "GET",
  "/webhooks",
  "List all webhooks configured in the CRM. Use this tool to view all callback subscriptions.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_webhook",
  "POST",
  "/webhooks",
  "Register a new webhook to receive event notifications. Provide the callback URL and event types.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Webhook details (URL, event types, etc.)"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_webhook",
  "GET",
  "/webhooks/:id",
  "Retrieve details of a webhook by its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Webhook ID" } },
    required: ["id"]
  }
);
addTool(
  "update_webhook",
  "PUT",
  "/webhooks/:id",
  "Update an existing webhook's configuration.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Webhook ID" },
      data: { type: "object", description: "Updated webhook fields" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_webhook",
  "DELETE",
  "/webhooks/:id",
  "Remove a webhook from the CRM using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Webhook ID" } },
    required: ["id"]
  }
);

// Webhook Events endpoint
addTool(
  "get_webhook_event",
  "GET",
  "/webhookEvents/:id",
  "Retrieve details for a specific webhook event (delivery log) using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Webhook event ID" } },
    required: ["id"]
  }
);

// Pipelines endpoints (Deal Pipelines)
addTool(
  "list_pipelines",
  "GET",
  "/pipelines",
  "List all deal pipelines. Use this tool to view the structure and stages of your sales pipelines.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_pipeline",
  "POST",
  "/pipelines",
  "Create a new deal pipeline. Provide details such as name and stages.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Pipeline details including name and stage structure"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_pipeline",
  "GET",
  "/pipelines/:id",
  "Retrieve details of a specific deal pipeline using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Pipeline ID" } },
    required: ["id"]
  }
);
addTool(
  "update_pipeline",
  "PUT",
  "/pipelines/:id",
  "Update an existing deal pipeline. Use this tool to modify the pipeline's name or stages.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Pipeline ID" },
      data: { type: "object", description: "Updated pipeline details" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_pipeline",
  "DELETE",
  "/pipelines/:id",
  "Remove a deal pipeline using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Pipeline ID" } },
    required: ["id"]
  }
);

// Deals endpoints
addTool(
  "list_deals",
  "GET",
  "/deals",
  "Retrieve all deals (opportunities) from the CRM.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_deal",
  "POST",
  "/deals",
  "Create a new deal in the CRM. Provide details such as deal name, value, and associated contact.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Deal details (e.g., name, value, contact ID)"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_deal",
  "GET",
  "/deals/:id",
  "Fetch detailed information about a specific deal using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Deal ID" } },
    required: ["id"]
  }
);
addTool(
  "update_deal",
  "PUT",
  "/deals/:id",
  "Update an existing deal. Use this tool to modify deal properties such as status or value.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Deal ID" },
      data: { type: "object", description: "Updated deal details" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_deal",
  "DELETE",
  "/deals/:id",
  "Remove a deal from the CRM using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Deal ID" } },
    required: ["id"]
  }
);
addTool(
  "add_deal_attachment",
  "POST",
  "/dealAttachments",
  "Attach a file to a deal. Use this tool to add supporting documents or images to a deal (requires registered system credentials).",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Attachment details (filename, file content in base64 or URL, and associated deal ID)"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_deal_attachment",
  "GET",
  "/dealAttachments/:id",
  "Retrieve details for a specific deal attachment using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Attachment ID" } },
    required: ["id"]
  }
);
addTool(
  "update_deal_attachment",
  "PUT",
  "/dealAttachments/:id",
  "Update a deal attachment's details (e.g., rename the file).",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Attachment ID" },
      data: { type: "object", description: "Updated attachment details" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_deal_attachment",
  "DELETE",
  "/dealAttachments/:id",
  "Remove a deal attachment using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Attachment ID" } },
    required: ["id"]
  }
);

// Deal Custom Fields endpoints
addTool(
  "list_deal_custom_fields",
  "GET",
  "/dealCustomFields",
  "List all custom field definitions specific to deals.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_deal_custom_field",
  "POST",
  "/dealCustomFields",
  "Create a new custom field definition for deals.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Custom field details (name, type, etc.)"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_deal_custom_field",
  "GET",
  "/dealCustomFields/:id",
  "Retrieve a custom field definition for deals by ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Custom field ID" } },
    required: ["id"]
  }
);
addTool(
  "update_deal_custom_field",
  "PUT",
  "/dealCustomFields/:id",
  "Update a custom field definition for deals.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Custom field ID" },
      data: { type: "object", description: "Updated custom field details" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_deal_custom_field",
  "DELETE",
  "/dealCustomFields/:id",
  "Delete a custom field definition for deals using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Custom field ID" } },
    required: ["id"]
  }
);

// Groups endpoints
addTool(
  "list_groups",
  "GET",
  "/groups",
  "Retrieve all groups (e.g., agent or distribution groups). Use this tool to view group structures.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "get_groups_round_robin",
  "GET",
  "/groups/roundRobin",
  "Get round-robin assignment info for groups. Use this tool to determine which agent should receive the next lead.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_group",
  "POST",
  "/groups",
  "Create a new group. Provide the group name and list of members.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Group details including name and member IDs"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_group",
  "GET",
  "/groups/:id",
  "Fetch details of a specific group using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Group ID" } },
    required: ["id"]
  }
);
addTool(
  "update_group",
  "PUT",
  "/groups/:id",
  "Update a group's information. Use this tool to change the group name or modify its members.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Group ID" },
      data: { type: "object", description: "Updated group details" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_group",
  "DELETE",
  "/groups/:id",
  "Remove a group using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Group ID" } },
    required: ["id"]
  }
);

// Teams endpoints
addTool(
  "list_teams",
  "GET",
  "/teams",
  "Retrieve all teams. Use this tool to view team configurations in the CRM.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_team",
  "POST",
  "/teams",
  "Create a new team. Provide team details such as name and member IDs.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Team details including name and members"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_team",
  "GET",
  "/teams/:id",
  "Fetch detailed information about a specific team by its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Team ID" } },
    required: ["id"]
  }
);
addTool(
  "update_team",
  "PUT",
  "/teams/:id",
  "Modify an existing team’s details.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Team ID" },
      data: { type: "object", description: "Updated team fields" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_team",
  "DELETE",
  "/teams/:id",
  "Remove a team from the system using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Team ID" } },
    required: ["id"]
  }
);

// Team Inboxes endpoint
addTool(
  "list_team_inboxes",
  "GET",
  "/teamInboxes",
  "Retrieve all team inboxes (shared communication channels).",
  { type: "object", properties: {}, required: [] }
);

// Ponds endpoints (lead ponds/unassigned lead pools)
addTool(
  "list_ponds",
  "GET",
  "/ponds",
  "List all lead ponds (unassigned lead pools). Use this tool to view leads that have not been claimed.",
  { type: "object", properties: {}, required: [] }
);
addTool(
  "create_pond",
  "POST",
  "/ponds",
  "Create a new lead pond. Provide details such as the pond name and criteria.",
  {
    type: "object",
    properties: {
      data: {
        type: "object",
        description: "Pond details (name, criteria, etc.)"
      }
    },
    required: ["data"]
  }
);
addTool(
  "get_pond",
  "GET",
  "/ponds/:id",
  "Fetch details of a specific lead pond using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Pond ID" } },
    required: ["id"]
  }
);
addTool(
  "update_pond",
  "PUT",
  "/ponds/:id",
  "Update a lead pond's details. Use this tool to modify pond criteria or name.",
  {
    type: "object",
    properties: {
      id: { type: "integer", description: "Pond ID" },
      data: { type: "object", description: "Updated pond information" }
    },
    required: ["id", "data"]
  }
);
addTool(
  "delete_pond",
  "DELETE",
  "/ponds/:id",
  "Remove a lead pond from the CRM using its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Pond ID" } },
    required: ["id"]
  }
);

// Reactions endpoints
addTool(
  "get_reaction",
  "GET",
  "/reactions/:id",
  "Retrieve a reaction's details by its ID. Use this tool to see who has reacted to an item.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Reaction ID" } },
    required: ["id"]
  }
);
addTool(
  "add_reaction",
  "POST",
  "/reactions/:refType/:refId",
  "Add a reaction (like a thumbs-up) to an item. Provide the item type and its ID. Use this tool to register positive feedback on a note or message.",
  {
    type: "object",
    properties: {
      refType: { type: "string", description: "Type of the item (e.g., Note, TextMessage)" },
      refId: { type: "integer", description: "ID of the item to react to" }
    },
    required: ["refType", "refId"]
  }
);
addTool(
  "remove_reaction",
  "DELETE",
  "/reactions/:refType/:refId",
  "Remove a reaction from an item by specifying the item type and ID.",
  {
    type: "object",
    properties: {
      refType: { type: "string", description: "Item type (e.g., Note, TextMessage)" },
      refId: { type: "integer", description: "ID of the item" }
    },
    required: ["refType", "refId"]
  }
);

// Threaded Replies endpoint
addTool(
  "get_threaded_reply",
  "GET",
  "/threadedReplies/:id",
  "Retrieve a specific threaded reply (part of a conversation) by its ID.",
  {
    type: "object",
    properties: { id: { type: "integer", description: "Threaded reply ID" } },
    required: ["id"]
  }
);

// Timeframes endpoint
addTool(
  "list_timeframes",
  "GET",
  "/timeframes",
  "Retrieve all timeframe categories (e.g., for buying or selling). Use this tool to view time-based segmentation.",
  { type: "object", properties: {}, required: [] }
);

// ----------------------------
// End of Tool Definitions Section
// ----------------------------

// ----------------------------
// Express Server: MCP
// ----------------------------
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// GET /sse: Return the tool list as an SSE event
app.get("/sse", (req, res) => {
  const toolsData = JSON.stringify(tools);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Send one SSE event with the tools data
  res.write(`data: ${toolsData}\n\n`);
  // Keep the connection open (do not call res.end())
});

// POST /messages: Process incoming MCP commands
app.post("/messages", async (req, res) => {
  try {
    const body = req.body || {};
    if (body.list_tools || (body.tool_request && body.tool_request.name === "list_tools")) {
      return res.json({ tools });
    } else if (body.tool_request) {
      const toolName = body.tool_request.name;
      const params = body.tool_request.parameters || {};
      if (!toolMap[toolName]) {
        return res.status(400).send(`Unknown tool: ${toolName}`);
      }
      const toolDef = toolMap[toolName];
      let url = `https://api.followupboss.com/v1${toolDef.path}`;
      if (url.includes(":")) {
        for (const key in params) {
          url = url.replace(`:${key}`, encodeURIComponent(params[key]));
        }
      }
      if (toolDef.method === "GET" || toolDef.method === "DELETE") {
        const queryParams = [];
        for (const [pKey, pVal] of Object.entries(params)) {
          if (toolDef.path.includes(`:${pKey}`)) continue;
          if (pVal === undefined || pVal === null) continue;
          queryParams.push(`${encodeURIComponent(pKey)}=${encodeURIComponent(pVal)}`);
        }
        if (queryParams.length > 0) {
          url += (url.includes("?") ? "&" : "?") + queryParams.join("&");
        }
      }
      const apiKey = process.env.FUB_API_KEY || "";
      const systemName = process.env.FUB_SYSTEM_NAME || "";
      const systemKey = process.env.FUB_SYSTEM_KEY || "";
      const authHeader = "Basic " + Buffer.from(apiKey + ":").toString("base64");
      const baseHeaders = {
        "Authorization": authHeader,
        "Content-Type": "application/json"
      };
      if (systemName && systemKey) {
        baseHeaders["X-System"] = systemName;
        baseHeaders["X-System-Key"] = systemKey;
      }
      const fetchOptions = { method: toolDef.method, headers: { ...baseHeaders } };
      if (["POST", "PUT", "PATCH"].includes(toolDef.method)) {
        fetchOptions.body = JSON.stringify(params.data || params);
      }
      console.log("DEBUG: Executing tool", toolName, "with URL", url);
      const fubResponse = await fetch(url, fetchOptions);
      const resultText = await fubResponse.text();
      let resultData;
      try {
        resultData = JSON.parse(resultText);
      } catch {
        resultData = resultText || `${fubResponse.status} ${fubResponse.statusText}`;
      }
      const toolResponse = {
        status: fubResponse.status,
        statusText: fubResponse.statusText,
        data: resultData
      };
      return res.json({ tool_response: toolResponse });
    } else {
      return res.status(400).send("Invalid request payload.");
    }
  } catch (error) {
    console.error("Error processing message:", error);
    return res.status(500).send(`Server error: ${error.message}`);
  }
});

// Fallback route for all other requests
app.all("*", (req, res) => {
  res.json({ status: "ok", message: "Use /sse for SSE tool list or POST to /messages for tool execution." });
});

// Start the server on the port defined by process.env.PORT (Fly.io sets this) or default to 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`MCP server listening on port ${port}`);
});
