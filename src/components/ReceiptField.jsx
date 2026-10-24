import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, FileText, Image as ImageIcon, Paperclip, ScanLine, Upload, X } from 'lucide-react';
import { canManageReceipts, importReceipt, openReceipt, scanReceipt } from '../services/receiptService';

const SOURCE_LABELS = { import: 'Importé', scan: 'Scanné' };

export default function ReceiptField({ receipt, onReceiptChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const menuRef = useRef(null);
  const available = canManageReceipts();

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDocClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const attach = async (action, status) => {
    setMenuOpen(false);
    setError('');
    setBusy(status);
    try {
      const next = await action();
      if (next) onReceiptChange(next);
    } catch (attachError) {
      setError(attachError.message);
    } finally {
      setBusy('');
    }
  };

  const open = async () => {
    setError('');
    try {
      await openReceipt(receipt);
    } catch (openError) {
      setError(openError.message);
    }
  };

  return (
    <div className="field receipt-field" role="group" aria-labelledby="receipt-label">
      <span id="receipt-label">Reçu du paiement</span>
      <div className="receipt-control">
        <div className={`receipt-slot ${receipt && !busy ? 'attached' : ''}`}>
          {busy ? (
            <span className="receipt-status">{busy}</span>
          ) : receipt ? (
            <>
              {receipt.type === 'application/pdf' ? <FileText size={15} /> : <ImageIcon size={15} />}
              <button type="button" className="receipt-name" onClick={open} title="Ouvrir le reçu">
                {receipt.name}
              </button>
              <small>{SOURCE_LABELS[receipt.source]}</small>
              <button
                type="button"
                className="receipt-remove"
                onClick={() => onReceiptChange(null)}
                title="Retirer le reçu"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <span className="receipt-empty">Aucun reçu joint : importez ou scannez le reçu</span>
          )}
        </div>
        <div className="receipt-menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="outline-btn receipt-trigger"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
            disabled={!available || Boolean(busy)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title={available ? 'Joindre le reçu du paiement' : 'Disponible dans l’application de bureau'}
          >
            <Paperclip size={15} />
            {receipt ? 'Remplacer' : 'Joindre'}
            <ChevronDown size={14} />
          </button>
          {menuOpen && (
            <div className="receipt-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => attach(importReceipt, 'Importation du reçu…')}>
                <Upload size={16} />
                <span>
                  <b>Importer un fichier</b>
                  <small>Image (PNG, JPG) ou PDF</small>
                </span>
              </button>
              <button type="button" role="menuitem" onClick={() => attach(scanReceipt, 'Numérisation en cours…')}>
                <ScanLine size={16} />
                <span>
                  <b>Scanner le reçu</b>
                  <small>Via le scanner de l’imprimante</small>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
      {error && (
        <small className="receipt-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
