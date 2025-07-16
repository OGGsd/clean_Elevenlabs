# Axie Studio - AI Agent Booking System

Book consultations with AI agents using conversational AI and Next.js, with automated booking data collection.

## Overview

This application allows users to interact with an AI agent from Axie Studio to book consultation appointments. The system collects user information (first name, last name, email) and booking preferences through natural conversation, then processes this data via webhooks for integration with external booking systems like n8n.

## Run locally

```bash
pnpm i
pnpm dev
```

## Conversational AI Agent Configuration

Navigate to the [Conversational AI Agent settings](https://elevenlabs.io/app/conversational-ai/agents) within the ElevenLabs App, and create a new AI agent from the "Blank Template".

### First Message

```
Hi there! I'm Alex from Axie Studio. I'm excited to help you book a consultation to discuss how we can create the perfect AI agent for your business. To get started, could you please tell me your first and last name?
```

### System Prompt

```
You are Alex, a friendly booking assistant from Axie Studio helping users book consultations for AI agent creation services. Follow this conversation flow:

"name_collection": First, collect the user's first and last name. Be friendly and professional. Once you have both names, proceed to the next step.

"email_collection": Ask for their email address so you can send them booking confirmation and details. Once you have their email, proceed to the next step.

"booking_conversation": Now use their name personally in conversation. Discuss their business needs, what kind of AI agent they're looking for, and help them book a suitable consultation time. Ask about:
- Their business and industry
- What kind of AI agent they need (customer service, sales, support, etc.)
- Their preferred consultation time/availability
- Any specific requirements or questions they have

Be conversational, use their first name throughout, and make them feel valued as a potential client. The goal is to book a consultation appointment.

Always call the `set_ui_state` tool when moving between steps!
```

### Tools

- **Client Tool Configuration**
  - Name: set_ui_state
  - Description: Use this client-side tool to navigate between the different UI states in the booking process.
  - Wait for response: true
  - Response timeout (seconds): 1
  - Parameters:
    - Data type: string
    - Identifier: step
    - Required: true
    - Value Type: LLM Prompt
    - Description: The step to navigate to in the UI. Use "name_collection", "email_collection", or "booking_conversation".

## Data Collection

The system collects the following data during conversations:

1. **first_name**
   - Data type: string
   - Identifier: first_name
   - Description: The user's first name

2. **last_name**
   - Data type: string
   - Identifier: last_name
   - Description: The user's last name

3. **email**
   - Data type: string
   - Identifier: email
   - Description: The user's email address for booking confirmation

4. **booking_details**
   - Data type: string
   - Identifier: booking_details
   - Description: Summary of the user's business needs, preferred consultation time, and any specific requirements discussed during the booking conversation.

## Post-call Webhook

Post-call webhooks are triggered when a conversation ends and send the collected booking data to external systems for processing.

The webhook receives:
- User's first and last name
- Email address
- Booking details and preferences
- Conversation analysis

This data can be integrated with booking systems, CRM platforms, or automation tools like n8n for further processing and appointment scheduling.

## Environment Variables

Create a `.env` file with:

```
ELEVENLABS_CONVAI_WEBHOOK_SECRET=your_webhook_secret
ELEVENLABS_API_KEY=your_api_key
ELEVENLABS_AGENT_ID=your_agent_id
```

## Integration with n8n

The post-call webhook is designed to integrate seamlessly with n8n workflows for:
- Automatic calendar booking
- CRM data entry
- Email confirmations
- Follow-up scheduling

## Conclusion

This Axie Studio booking system demonstrates how conversational AI can streamline the consultation booking process while collecting valuable customer data for business automation workflows.