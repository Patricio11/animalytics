import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface VetInvitationEmailProps {
  firstName?: string;
  clinicName: string;
  inviterName: string;
  inviterRole: string;
  inviteUrl: string;
  message?: string;
  expiresInDays?: number;
}

export const VetInvitationEmail = ({
  firstName = 'there',
  clinicName,
  inviterName,
  inviterRole,
  inviteUrl,
  message,
  expiresInDays = 7,
}: VetInvitationEmailProps) => {
  const previewText = `Join ${clinicName} on Animalytics`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
              width="120"
              height="40"
              alt="Animalytics"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>
              You're Invited to Join {clinicName}!
            </Heading>

            <Text style={text}>Hi Dr. {firstName},</Text>

            <Text style={text}>
              {inviterName} ({inviterRole}) has invited you to join <strong>{clinicName}</strong> on Animalytics,
              the comprehensive animal breeding and health management platform.
            </Text>

            {message && (
              <Section style={messageBox}>
                <Text style={messageText}>
                  <strong>Personal Message:</strong>
                </Text>
                <Text style={messageText}>"{message}"</Text>
              </Section>
            )}

            <Text style={text}>
              As a veterinarian on Animalytics, you'll be able to:
            </Text>

            <ul style={list}>
              <li style={listItem}>Manage your clinic profile and services</li>
              <li style={listItem}>Conduct and record semen assessments</li>
              <li style={listItem}>Track animal health records and appointments</li>
              <li style={listItem}>Collaborate with breeders and other veterinarians</li>
              <li style={listItem}>Access advanced breeding analytics</li>
            </ul>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={inviteUrl}>
                Accept Invitation
              </Button>
            </Section>

            <Text style={text}>
              Or copy and paste this URL into your browser:
            </Text>
            <Link href={inviteUrl} style={link}>
              {inviteUrl}
            </Link>

            <Hr style={hr} />

            <Text style={footer}>
              This invitation will expire in <strong>{expiresInDays} days</strong>.
              If you didn't expect this invitation, you can safely ignore this email.
            </Text>

            <Text style={footer}>
              Need help? Contact us at{' '}
              <Link href="mailto:support@animalytics.com" style={link}>
                support@animalytics.com
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Animalytics. All rights reserved.
            </Text>
            <Text style={footerText}>
              Professional Animal Breeding & Health Management
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VetInvitationEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const logoSection = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '0 48px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const messageBox = {
  backgroundColor: '#f3f4f6',
  borderLeft: '4px solid #3b82f6',
  padding: '16px 20px',
  margin: '24px 0',
  borderRadius: '4px',
};

const messageText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
};

const list = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
};

const link = {
  color: '#3b82f6',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
};

const footerSection = {
  padding: '32px 48px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '4px 0',
};
