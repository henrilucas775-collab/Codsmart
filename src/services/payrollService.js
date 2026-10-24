import { payrollSeed } from '../data/payrollSeed';
import { migratePayrollData } from '../utils/migrations';

const hasElectronBridge = () => typeof window !== 'undefined' && !!window.electronAPI;

export class PayrollRepository {
  constructor(storage = undefined, key = 'gc-payroll') {
    this.storage = storage || (typeof localStorage !== 'undefined' ? localStorage : undefined);
    this.key = key;
  }

  // Comme pour les charges : une donnée illisible fait échouer le chargement au lieu de repartir du seed.
  async load() {
    if (hasElectronBridge() && window.electronAPI.getPayroll) {
      const loaded = await window.electronAPI.getPayroll();
      return loaded && Object.keys(loaded).length ? migratePayrollData(loaded) : payrollSeed;
    }

    const saved = this.storage?.getItem(this.key);
    return saved ? migratePayrollData(JSON.parse(saved)) : payrollSeed;
  }

  async save(data) {
    if (hasElectronBridge() && window.electronAPI.savePayroll) {
      await window.electronAPI.savePayroll(data);
      return data;
    }

    this.storage?.setItem(this.key, JSON.stringify(data));
    return data;
  }
}

export const payrollRepository = new PayrollRepository();
