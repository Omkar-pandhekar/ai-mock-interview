"use server";

import { db } from "@/firebase/admin";
import { AcademicDetails } from "@/types";

// Eligibility criteria
const ELIGIBILITY_CRITERIA = {
  MIN_EDUCATION_LEVEL: ["bachelor", "master", "phd"] as const,
  MIN_GPA: 3.0,
  MAX_GRADUATION_YEARS_BACK: 10,
};

// Check if user meets eligibility criteria for interviews
export async function checkEligibility(userId: string): Promise<{
  isEligible: boolean;
  reasons: string[];
  academicDetails?: AcademicDetails;
}> {
  try {
    // Get user record from database
    const userRecord = await db.collection("users").doc(userId).get();
    
    if (!userRecord.exists) {
      return {
        isEligible: false,
        reasons: ["User not found"],
      };
    }

    const userData = userRecord.data() as { academicDetails?: AcademicDetails };
    const academicDetails = userData.academicDetails;

    // If no academic details, user is not eligible
    if (!academicDetails) {
      return {
        isEligible: false,
        reasons: ["Academic details not provided. Please complete your academic profile."],
      };
    }

    const reasons: string[] = [];
    let isEligible = true;

    // Check education level
    if (!ELIGIBILITY_CRITERIA.MIN_EDUCATION_LEVEL.includes(academicDetails.highestEducation as "bachelor" | "master" | "phd")) {
      isEligible = false;
      reasons.push(`Minimum education level required: ${ELIGIBILITY_CRITERIA.MIN_EDUCATION_LEVEL.join(", ")}. Your level: ${academicDetails.highestEducation}`);
    }

    // Check CGPA if provided
    if (academicDetails.cgpa && academicDetails.cgpa < ELIGIBILITY_CRITERIA.MIN_GPA) {
      isEligible = false;
      reasons.push(`Minimum CGPA required: ${ELIGIBILITY_CRITERIA.MIN_GPA}. Your CGPA: ${academicDetails.cgpa}`);
    }

    // Check graduation year (not too old)
    const currentYear = new Date().getFullYear();
    const yearsSinceGraduation = currentYear - academicDetails.graduationYear;
    
    if (!academicDetails.isCurrentlyStudent && yearsSinceGraduation > ELIGIBILITY_CRITERIA.MAX_GRADUATION_YEARS_BACK) {
      isEligible = false;
      reasons.push(`Graduation should be within the last ${ELIGIBILITY_CRITERIA.MAX_GRADUATION_YEARS_BACK} years. Your graduation was ${yearsSinceGraduation} years ago.`);
    }

    return {
      isEligible,
      reasons,
      academicDetails,
    };
  } catch (error) {
    console.error("Error checking eligibility:", error);
    return {
      isEligible: false,
      reasons: ["Error checking eligibility. Please try again."],
    };
  }
}

// Update user's academic details
export async function updateAcademicDetails(userId: string, academicDetails: AcademicDetails): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Validate academic details
    const validation = validateAcademicDetails(academicDetails);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.errors.join(", "),
      };
    }

    // Update user record
    await db.collection("users").doc(userId).update({
      academicDetails,
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Academic details updated successfully",
    };
  } catch (error) {
    console.error("Error updating academic details:", error);
    return {
      success: false,
      message: "Failed to update academic details. Please try again.",
    };
  }
}

// Validate academic details structure
function validateAcademicDetails(academicDetails: AcademicDetails): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check graduation year
  const currentYear = new Date().getFullYear();
  if (academicDetails.graduationYear < 1950 || academicDetails.graduationYear > currentYear + 10) {
    errors.push("Invalid graduation year");
  }

  // Check CGPA range if provided
  if (academicDetails.cgpa && (academicDetails.cgpa < 0 || academicDetails.cgpa > 10)) {
    errors.push("CGPA must be between 0.0 and 10.0");
  }

  // Check required fields
  if (!academicDetails.field || academicDetails.field.trim().length === 0) {
    errors.push("Field of study is required");
  }

  if (!academicDetails.institution || academicDetails.institution.trim().length === 0) {
    errors.push("Institution name is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Get eligibility criteria (for frontend display)
export async function getEligibilityCriteria() {
  return {
    ...ELIGIBILITY_CRITERIA,
    description: {
      educationLevel: `Must have at least ${ELIGIBILITY_CRITERIA.MIN_EDUCATION_LEVEL.join(", ")} degree`,
      cgpa: `Minimum CGPA of ${ELIGIBILITY_CRITERIA.MIN_GPA} (if provided)`,
      graduationYear: `Graduated within the last ${ELIGIBILITY_CRITERIA.MAX_GRADUATION_YEARS_BACK} years (unless currently student)`,
    },
  };
}
