const DOC_KEYS = ['cnh', 'cpf', 'rg', 'proof_of_residence', 'criminal_record', 'passport'];

const DOC_ALIASES = {
  cnh: ['cnh'],
  cpf: ['cpf', 'cpfUrl'],
  rg: ['rg', 'rgUrl'],
  proof_of_residence: ['proof_of_residence', 'proofOfResidenceUrl'],
  criminal_record: ['criminal_record', 'criminalRecordUrl'],
  passport: ['passport', 'passportUrl'],
};

export function normalizeUserDocuments(rawDocs) {
  const source = rawDocs || {};
  const normalized = {};

  DOC_KEYS.forEach((key) => {
    const aliases = DOC_ALIASES[key] || [key];
    const value = aliases
      .map((alias) => source[alias])
      .find((candidate) => typeof candidate === 'string' && candidate.trim() !== '');

    normalized[key] = value || '';
  });

  return normalized;
}

export function countValidDocuments(rawDocs) {
  const docs = normalizeUserDocuments(rawDocs);
  return DOC_KEYS.filter((key) => docs[key]).length;
}

export function listAvailableDocuments(rawDocs) {
  const docs = normalizeUserDocuments(rawDocs);
  return DOC_KEYS.filter((key) => docs[key]).map((key) => [key, docs[key]]);
}
