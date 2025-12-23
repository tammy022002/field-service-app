/**
 * Cyan Corporate Theme
 * Professional, modern design with cyan/teal color palette
 */

export const colors = {
    // Primary Colors - Cyan Theme
    primary: '#0891A8',           // Medium Teal - headers, navigation
    primaryDark: '#066B7D',       // Dark Teal - footer, darker elements
    primaryLight: '#40C4D3',      // Bright Cyan - lighter elements

    // Accent Colors
    accent: '#0891A8',            // Teal - buttons, links, highlights
    accentDark: '#066B7D',        // Dark Teal for hover
    accentLight: '#40C4D3',       // Light cyan for subtle highlights

    // Background Colors
    background: '#FFFFFF',        // Clean white layout
    backgroundLight: '#F8F9FA',   // Light gray for sections
    backgroundDark: '#F0F2F5',    // Slightly darker sections

    // Text Colors
    textPrimary: '#000000',       // Black for headings
    textSecondary: '#333333',     // Dark gray for body text
    textMuted: '#666666',         // Muted text
    textLight: '#999999',         // Light text
    textWhite: '#FFFFFF',         // White text on dark backgrounds

    // UI Element Colors
    border: '#E0E0E0',            // Light gray borders
    borderLight: '#F0F0F0',       // Very light borders
    divider: '#E8E8E8',           // Section dividers

    // Status Colors
    success: '#28A745',           // Green for done/success
    warning: '#FFA500',           // Orange for pending/warning
    danger: '#DC3545',            // Red for errors/logout
    info: '#17A2B8',              // Teal for info

    // Interaction Type Colors
    call: '#0891A8',              // Teal for calls
    email: '#E91E63',             // Pink for email
    message: '#9C27B0',           // Purple for messages
    direction: '#6C757D',         // Gray for direction badges

    // Gradient Colors (for LoginScreen)
    gradientStart: '#7FE5F0',     // Light cyan
    gradientMiddle: '#40C4D3',    // Bright cyan
    gradientEnd: '#066B7D',       // Dark teal

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(255, 255, 255, 0.2)',
};

export const typography = {
    fontFamily: {
        regular: 'System',
        bold: 'System',
    },
    fontSize: {
        xs: 11,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18,
        xxl: 20,
        xxxl: 24,
        display: 28,
        logo: 40,
    },
    fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
    lineHeight: {
        tight: 20,
        normal: 24,
        relaxed: 28,
        loose: 36,
    },
};

export const spacing = {
    xs: 5,
    sm: 10,
    md: 15,
    lg: 20,
    xl: 25,
    xxl: 30,
    xxxl: 40,
};

export const borderRadius = {
    sm: 5,
    md: 8,
    lg: 12,
    xl: 15,
    round: 20,
    pill: 25,
    circle: 50,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
};

export const commonStyles = {
    header: {
        backgroundColor: colors.primary,
        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    card: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    primaryButton: {
        backgroundColor: colors.accent,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
    },
    secondaryButton: {
        backgroundColor: colors.primaryDark,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: typography.fontSize.lg,
        color: colors.textSecondary,
        backgroundColor: colors.background,
    },
};

export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    commonStyles,
};
