// Politique Trusted Types pour atténuer les attaques XSS basées sur le DOM
if (typeof window !== 'undefined' && window.trustedTypes && window.trustedTypes.createPolicy) {
  window.trustedTypes.createPolicy('default', {
    createHTML: (string) => string,
    createScript: (string) => string,
    createScriptURL: (string) => string
  });
}
