/**
 * Clerk.com Configuration
 *
 * This file contains configuration settings for Clerk authentication.
 * In a real application, you would use environment variables for the publishable key.
 */

// For development, we're using a test key - in production this should come from environment variables
export const clerkPublishableKey =
  process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

/**
 * Customize the appearance of Clerk components
 * This defines the visual styling of all Clerk authentication UI
 */
export const clerkAppearance = {
  layout: {
    socialButtonsPlacement: "bottom" as const,
    socialButtonsVariant: "iconButton" as const,
    termsPageUrl: "https://www.example.com/terms",
    privacyPageUrl: "https://www.example.com/privacy",
    helpPageUrl: "https://www.example.com/help",
  },
  variables: {
    colorPrimary: "#5e35b1",
    colorTextOnPrimaryBackground: "white",
    borderRadius: "8px",
  },
  elements: {
    card: {
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e0e0e0",
    },
    formButtonPrimary: {
      fontSize: "16px",
      textTransform: "none",
      fontWeight: 600,
    },
    formFieldInput: {
      borderRadius: "4px",
    },
  },
};

/**
 * Routes configuration for Clerk authentication
 * These settings control where users are redirected after authentication actions
 * Note: We use modal mode for sign-in/sign-up, so no dedicated routes needed
 */
export const clerkRoutes = {
  userProfile: "/user",
  afterSignInRedirectUrl: "/dashboard",
  afterSignUpRedirectUrl: "/dashboard",
};

/**
 * Development helper for debugging Clerk configuration issues
 */
if (!clerkPublishableKey) {
  console.warn("Missing Clerk publishable key - authentication will fail");
}
