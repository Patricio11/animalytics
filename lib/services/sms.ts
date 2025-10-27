// ============================================================================
// SMS SERVICE - BulkSMS Integration
// ============================================================================

interface BulkSMSConfig {
  username: string;
  password: string;
  baseUrl: string;
}

interface SMSMessage {
  to: string; // Phone number in international format (e.g., +27821234567)
  body: string;
}

interface BulkSMSResponse {
  id: string;
  type: string;
  from: string;
  to: string;
  body: string;
  encoding: string;
  protocolId: number;
  messageClass: number;
  numberOfParts: number;
  creditCost: number;
  submission: {
    date: string;
    type: string;
  };
  status: {
    type: string;
    subtype: string;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const getBulkSMSConfig = (): BulkSMSConfig => {
  return {
    username: process.env.BULKSMS_USERNAME || '',
    password: process.env.BULKSMS_PASSWORD || '',
    baseUrl: process.env.BULKSMS_BASE_URL || 'https://api.bulksms.com/v1',
  };
};

// ============================================================================
// SMS SENDING FUNCTIONS
// ============================================================================

/**
 * Send SMS via BulkSMS API
 */
export async function sendSMS(message: SMSMessage): Promise<boolean> {
  try {
    const config = getBulkSMSConfig();
    
    if (!config.username || !config.password) {
      console.error('BulkSMS credentials not configured');
      return false;
    }

    // Create Basic Auth header
    const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

    const response = await fetch(`${config.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        to: message.to,
        body: message.body,
        encoding: 'UNICODE', // Support emojis and special characters
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('BulkSMS API error:', error);
      return false;
    }

    const result: BulkSMSResponse = await response.json();
    console.log('SMS sent successfully:', result.id);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

/**
 * Send progesterone test reminder SMS
 */
export async function sendProgesteroneReminderSMS(
  to: string,
  data: {
    bitchName: string;
    day: number;
    dueDate: string;
  }
): Promise<boolean> {
  const message = `🔔 Progesterone Test Reminder\n\n` +
    `${data.bitchName} - Day ${data.day}\n` +
    `Test due: ${data.dueDate}\n\n` +
    `Log in to Animalytics to record results.`;

  return sendSMS({ to, body: message });
}

/**
 * Send breeding window alert SMS
 */
export async function sendBreedingWindowSMS(
  to: string,
  data: {
    bitchName: string;
    progesteroneLevel: number;
    day: number;
  }
): Promise<boolean> {
  const message = `🎯 BREEDING WINDOW OPEN!\n\n` +
    `${data.bitchName} - Day ${data.day}\n` +
    `Progesterone: ${data.progesteroneLevel} ng/mL\n\n` +
    `⚠️ Breed within 24-48 hours for optimal results!\n\n` +
    `Check Animalytics for breeding schedule.`;

  return sendSMS({ to, body: message });
}

/**
 * Send daily test reminder SMS
 */
export async function sendDailyTestReminderSMS(
  to: string,
  data: {
    bitchName: string;
    day: number;
    lastLevel: number;
  }
): Promise<boolean> {
  const message = `⚡ DAILY TEST REQUIRED\n\n` +
    `${data.bitchName} - Day ${data.day}\n` +
    `Last reading: ${data.lastLevel} ng/mL\n\n` +
    `Levels rising - test TODAY to avoid missing breeding window!`;

  return sendSMS({ to, body: message });
}

/**
 * Send whelping reminder SMS
 */
export async function sendWhelpingReminderSMS(
  to: string,
  data: {
    bitchName: string;
    whelpingDate: string;
    daysUntil: number;
  }
): Promise<boolean> {
  const message = `👶 Whelping Approaching\n\n` +
    `${data.bitchName}\n` +
    `Expected: ${data.whelpingDate}\n` +
    `${data.daysUntil} days remaining\n\n` +
    `Prepare whelping area and supplies.`;

  return sendSMS({ to, body: message });
}

// ============================================================================
// BATCH SMS SENDING
// ============================================================================

/**
 * Send SMS to multiple recipients
 */
export async function sendBatchSMS(
  messages: SMSMessage[]
): Promise<{ success: number; failed: number }> {
  const results = await Promise.allSettled(
    messages.map(msg => sendSMS(msg))
  );

  const success = results.filter(r => r.status === 'fulfilled' && r.value).length;
  const failed = results.length - success;

  return { success, failed };
}

// ============================================================================
// VERIFY SMS CONFIGURATION
// ============================================================================

/**
 * Verify BulkSMS configuration
 */
export async function verifySMSConfig(): Promise<boolean> {
  try {
    const config = getBulkSMSConfig();
    
    if (!config.username || !config.password) {
      console.error('❌ BulkSMS credentials not configured');
      return false;
    }

    // Test API connection by checking profile
    const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');
    
    const response = await fetch(`${config.baseUrl}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      console.error('❌ BulkSMS authentication failed');
      return false;
    }

    console.log('✅ BulkSMS configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ BulkSMS configuration verification failed:', error);
    return false;
  }
}

// ============================================================================
// PHONE NUMBER VALIDATION
// ============================================================================

/**
 * Validate and format phone number for international format
 */
export function formatPhoneNumber(phone: string, defaultCountryCode: string = '+27'): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If number starts with 0, replace with country code
  if (cleaned.startsWith('0')) {
    cleaned = defaultCountryCode.replace('+', '') + cleaned.substring(1);
  }
  
  // Add + prefix if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Basic validation: starts with + and has 10-15 digits
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(phone);
}
