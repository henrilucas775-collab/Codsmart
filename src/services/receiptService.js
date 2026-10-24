// Reçus de paiement : importés ou scannés par le processus Electron, rangés dans le dossier des données.
const bridge = () => (typeof window !== 'undefined' ? window.electronAPI : undefined);

export const canManageReceipts = () => Boolean(bridge()?.importReceipt);

const unwrap = async (request) => {
  const result = await request;
  if (result?.error) {
    throw new Error(result.error);
  }
  return result?.value ?? null;
};

export const importReceipt = () => unwrap(bridge().importReceipt());

export const scanReceipt = () => unwrap(bridge().scanReceipt());

export const openReceipt = (receipt) => unwrap(bridge().openReceipt(receipt.file));
