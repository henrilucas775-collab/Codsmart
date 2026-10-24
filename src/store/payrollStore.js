import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultPeriod, payrollNav, payrollSeed } from '../data/payrollSeed';
import { payrollRepository } from '../services/payrollService';
import { buildPayslipDraft, computePayslip } from '../utils/payroll';

export function usePayrollStore() {
  const [page, setPage] = useState(payrollNav[0]);
  const [data, setData] = useState(payrollSeed);
  const [isLoaded, setIsLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState(defaultPeriod);
  const [toast, setToast] = useState('');
  const [employeeModal, setEmployeeModal] = useState(null);
  const [payslipModal, setPayslipModal] = useState(null);
  const [loadError, setLoadError] = useState('');

  const notify = useCallback((message) => {
    setToast(message);
    if (notify.timer) clearTimeout(notify.timer);
    notify.timer = setTimeout(() => setToast(''), 2600);
  }, []);

  useEffect(() => {
    let mounted = true;
    payrollRepository
      .load()
      .then((loaded) => {
        if (mounted) {
          setData(loaded?.employees ? loaded : payrollSeed);
          setIsLoaded(true);
        }
      })
      .catch(() => {
        // isLoaded reste à false : aucune sauvegarde ne viendra écraser les données existantes.
        if (mounted) {
          setLoadError(
            'Les données de paie n’ont pas pu être lues. La sauvegarde automatique est suspendue pour ne pas écraser le fichier existant.'
          );
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    payrollRepository.save(data).catch(() => notify('Échec de l’enregistrement des données de paie'));
  }, [data, isLoaded, notify]);

  const employees = useMemo(() => data.employees || [], [data.employees]);
  const attendance = useMemo(() => data.attendance || [], [data.attendance]);
  const payslips = useMemo(() => data.payslips || [], [data.payslips]);

  const filteredEmployees = useMemo(
    () =>
      employees.filter((employee) =>
        `${employee.name} ${employee.matricule} ${employee.function}`.toLowerCase().includes(query.toLowerCase())
      ),
    [employees, query]
  );

  const periodAttendance = useMemo(
    () => attendance.filter((row) => row.period === period),
    [attendance, period]
  );

  const periodPayslips = useMemo(
    () => payslips.filter((row) => row.period === period),
    [payslips, period]
  );

  const stats = useMemo(() => {
    const activeEmployees = employees.filter((e) => e.status === 'Actif').length;
    const slips = periodPayslips.map((slip) => ({ ...slip, totals: computePayslip(slip) }));
    const payrollMass = slips.reduce((sum, slip) => sum + slip.totals.netPay, 0);
    const presentTotal = periodAttendance.reduce((sum, row) => sum + (row.presentDays || 0), 0);
    return { activeEmployees, payrollMass, presentTotal, payslipCount: slips.length };
  }, [employees, periodAttendance, periodPayslips]);

  const saveEmployee = useCallback(
    (employee) => {
      setData((previous) => {
        const list = previous.employees || [];
        const exists = list.some((item) => item.id === employee.id);
        return {
          ...previous,
          employees: exists
            ? list.map((item) => (item.id === employee.id ? employee : item))
            : [{ ...employee, id: employee.id ?? Date.now() }, ...list]
        };
      });
      setEmployeeModal(null);
      notify('Employé enregistré');
    },
    [notify]
  );

  const removeEmployee = useCallback(
    (id) => {
      if (!window.confirm('Supprimer cet employé ?')) return;
      setData((previous) => ({
        ...previous,
        employees: (previous.employees || []).filter((item) => item.id !== id),
        attendance: (previous.attendance || []).filter((item) => item.employeeId !== id),
        payslips: (previous.payslips || []).filter((item) => item.employeeId !== id)
      }));
      notify('Employé supprimé');
    },
    [notify]
  );

  const saveAttendance = useCallback((row) => {
    setData((previous) => {
      const list = previous.attendance || [];
      const exists = list.some((item) => item.id === row.id);
      return {
        ...previous,
        attendance: exists
          ? list.map((item) => (item.id === row.id ? row : item))
          : [{ ...row, id: row.id ?? Date.now() }, ...list]
      };
    });
    notify('Présence enregistrée');
  }, [notify]);

  const savePayslip = useCallback(
    (payslip) => {
      setData((previous) => {
        const list = previous.payslips || [];
        const exists = list.some((item) => item.id === payslip.id);
        return {
          ...previous,
          payslips: exists
            ? list.map((item) => (item.id === payslip.id ? payslip : item))
            : [{ ...payslip, id: payslip.id ?? Date.now() }, ...list]
        };
      });
      setPayslipModal(null);
      notify('Bulletin enregistré');
    },
    [notify]
  );

  const createPayslipForEmployee = useCallback(
    (employeeId) => {
      const employee = employees.find((item) => item.id === employeeId);
      if (!employee) {
        notify('Ajoutez d’abord un employé dans le référentiel RH');
        return;
      }
      const att = attendance.find((item) => item.employeeId === employeeId && item.period === period);
      const draft = buildPayslipDraft(employee, att, period);
      setPayslipModal(draft);
    },
    [attendance, employees, notify, period]
  );

  const removePayslip = useCallback(
    (id) => {
      if (!window.confirm('Supprimer ce bulletin ?')) return;
      setData((previous) => ({
        ...previous,
        payslips: (previous.payslips || []).filter((item) => item.id !== id)
      }));
      notify('Bulletin supprimé');
    },
    [notify]
  );

  return {
    page,
    setPage,
    data,
    query,
    setQuery,
    period,
    setPeriod,
    toast,
    loadError,
    notify,
    employees,
    filteredEmployees,
    periodAttendance,
    periodPayslips,
    stats,
    employeeModal,
    setEmployeeModal,
    payslipModal,
    setPayslipModal,
    saveEmployee,
    removeEmployee,
    saveAttendance,
    savePayslip,
    createPayslipForEmployee,
    removePayslip
  };
}
