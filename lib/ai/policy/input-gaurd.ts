export function validateHintInput(userCode: string, problemDescription: string) {
  if (!problemDescription) {
    return { valid: false, error: "Problem description is missing." };
  }

  // Prevent token waste on massive code dumps
  if (userCode && userCode.length > 5000) {
    return {
      valid: false,
      error: "Code snippet is too long (max 5,000 characters). Select a smaller block.",
    };
  }

  return { valid: true };
}