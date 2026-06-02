export const translationPrompts = (text: string, targetLanguage: string) => ({
  system:
    "You are a professional translator. Translate the text accurately while preserving meaning and tone. IMPORTANT: Do not include any additional text other than the translation.",
  user: `Translate the following text to ${targetLanguage}:\n\n${text}`,
});

export const grammarPrompts = (text: string, targetLanguage: string) => ({
  system:
    "You are an expert in grammar and the Chinese language. IMPORTANT: Do not include any additional text other than the explanation.",
  user: `Explain the grammar and syntax in the following text in ${targetLanguage}.
Do not include any additional text other than the explanation.
Use markdown to format the response so it can be displayed nicely on a front end:

${text}`,
});
