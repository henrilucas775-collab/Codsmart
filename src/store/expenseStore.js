import { useCallback, useEffect, useMemo, useState } from 'react';
import { expenseRepository, exportCsv } from '../services/expenseService';
import { initialBalance, seed } from '../data/seed';
import { flattenRecords, getGlobalSnapshot, getMovementKind } from '../utils/finance';

export function useExpenseStore() {
  const repository = useMemo(() => expenseRepository, []);
  const [page, setPage] = useState('Tableau de bord');
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState(seed);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    repository.load().then((loaded) => {
      if (isMounted) {
        setRecords(loaded || seed);
        setIsLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [repository]);

  useEffect(() => {
    if (!isLoaded) return;
    repository.save(records);
  }, [records, repository, isLoaded]);

  const notify = useCallback((message) => {
    setToast(message);
    if (notify.timer) {
      clearTimeout(notify.timer);
    }
    notify.timer = setTimeout(() => setToast(''), 2600);
  }, []);

  const all = useMemo(() => flattenRecords(records), [records]);
  const globalSnapshot = useMemo(() => getGlobalSnapshot(all), [all]);
  const chargeTotal = useMemo(
    () =>
      all
        .filter((item) => getMovementKind(item) === 'charge')
        .reduce((sum, item) => sum + (item.status === 'Rejeté' ? 0 : Number(item.amount || 0)), 0),
    [all]
  );
  const total = useMemo(
    () => globalSnapshot.balance,
    [globalSnapshot]
  );

  const pageRecords = records[page] || [];
  const filtered = useMemo(
    () =>
      pageRecords.filter(
        (record) =>
          `${record.name} ${record.type} ${record.description} ${record.status}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (filter === 'Tous' || record.status === filter)
      ),
    [pageRecords, query, filter]
  );

  const saveRecord = useCallback(
    (data) => {
      const id = edit?.id || Date.now();
      setRecords((previous) => ({
        ...previous,
        [page]: edit
          ? (previous[page] || []).map((record) => (record.id === id ? { ...record, ...data, id, page } : record))
          : [{ ...data, id, page }, ...(previous[page] || [])]
      }));
      setModal(false);
      setEdit(null);
      notify(edit ? 'Opération modifiée' : 'Opération enregistrée avec succès');
    },
    [edit, notify, page]
  );

  const removeRecord = useCallback(
    (id) => {
      if (window.confirm('Supprimer définitivement cette opération ?')) {
        setRecords((previous) => ({
          ...previous,
          [page]: (previous[page] || []).filter((record) => record.id !== id)
        }));
        notify('Opération supprimée');
      }
    },
    [notify, page]
  );

  const exportCSV = useCallback(() => {
    const filename = `rapport-${page.toLowerCase().replaceAll(' ', '-')}.csv`;
    exportCsv(filtered, filename);
    notify('Export CSV téléchargé');
  }, [filtered, notify, page]);

  return {
    page,
    setPage,
    collapsed,
    setCollapsed,
    mobile,
    setMobile,
    query,
    setQuery,
    filter,
    setFilter,
    records,
    total,
    modal,
    setModal,
    edit,
    setEdit,
    toast,
    setToast,
    all,
    pageRecords,
    filtered,
    notify,
    saveRecord,
    removeRecord,
    exportCSV
  };
}
