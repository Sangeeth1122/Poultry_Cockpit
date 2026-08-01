'use client';

import React, { useState } from 'react';
import { Layers, X, ShieldAlert, Save } from 'lucide-react';
import { BatchRecord, ShedRecord, UserRole } from '../../types';
import { BusinessEngine } from '../../engine';

interface EditBatchModalProps {
  batch: BatchRecord;
  sheds: ShedRecord[];
  userRole: UserRole;
  onSave: (updated: BatchRecord) => Promise<void>;
  onClose: () => void;
}

export function EditBatchModal({
  batch,
  sheds,
  userRole,
  onSave,
  onClose,
}: EditBatchModalProps) {
  const [companyName, setCompanyName] = useState(batch.company_name);
  const [breed, setBreed] = useState(batch.breed);
  const [targetDays, setTargetDays] = useState(batch.target_days_in_house);
  const [chickCost, setChickCost] = useState(batch.chick_cost_per_bird);
  const [supplierName, setSupplierName] = useState(batch.supplier_name || '');
  const [formulaProfile, setFormulaProfile] = useState(batch.formula_profile);
  const [notes, setNotes] = useState(batch.notes || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      BusinessEngine.validateBatchUpdate(userRole, batch.status);

      await onSave({
        ...batch,
        company_name: companyName,
        breed,
        target_days_in_house: targetDays,
        chick_cost_per_bird: chickCost,
        supplier_name: supplierName,
        formula_profile: formulaProfile,
        notes,
        updated_at: new Date().toISOString(),
      });

      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('An unexpected error occurred during batch update.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#3b562b]" />
            <span>Edit Batch Parameters ({batch.batch_number})</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Integrator</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#3b562b] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Chick Breed</label>
              <input
                type="text"
                required
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#3b562b] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Days</label>
              <input
                type="number"
                required
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-[#3b562b] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cost / Chick (₹)</label>
              <input
                type="number"
                step="0.1"
                required
                value={chickCost}
                onChange={(e) => setChickCost(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-[#3b562b] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Formula Profile</label>
              <input
                type="text"
                required
                value={formulaProfile}
                onChange={(e) => setFormulaProfile(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-[#3b562b] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Supplier / Hatchery</label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#3b562b] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Batch Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-[#3b562b] outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
