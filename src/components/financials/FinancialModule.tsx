'use client';

import React, { useState } from 'react';
import { Receipt, ShieldAlert } from 'lucide-react';
import { BatchRecord, FinancialTransactionRecord, FinancialType, UserRole } from '../../types';
import { BusinessEngine } from '../../engine';

interface FinancialModuleProps {
  activeBatch: BatchRecord | null;
  financials: FinancialTransactionRecord[];
  userRole: UserRole;
  userId: string;
  onFinancialSaved: (tx: Omit<FinancialTransactionRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function FinancialModule({
  activeBatch,
  financials,
  userRole,
  userId,
  onFinancialSaved,
}: FinancialModuleProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txType, setTxType] = useState<FinancialType>('Expense');
  const [category, setCategory] = useState('Feed Supplies');
  const [description, setDescription] = useState('Starter Feed Bag Delivery');
  const [partyName, setPartyName] = useState('Suguna Feeds Ltd');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque' | 'Credit'>('Bank Transfer');
  const [amount, setAmount] = useState(45000);
  const [paidAmount, setPaidAmount] = useState(45000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!activeBatch) {
      setErrorMsg('No active batch selected for financial entry.');
      return;
    }

    try {
      BusinessEngine.assertPermission(userRole, 'MANAGE_FINANCIALS');

      const pendingAmount = Math.max(0, amount - paidAmount);
      const status = pendingAmount === 0 ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : 'Pending';

      await onFinancialSaved({
        batch_id: activeBatch.id,
        tx_date: txDate,
        tx_type: txType,
        category,
        description,
        party_name: partyName || null,
        payment_mode: paymentMode,
        amount,
        paid_amount: paidAmount,
        pending_amount: pendingAmount,
        status,
        created_by: userId,
        updated_by: userId,
      });

      setDescription('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Validation failed during financial transaction recording.');
      }
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#e3ebd8] text-[#3b562b] flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Financial Ledger</h2>
          </div>
          <p className="text-xs text-slate-500">
            Log expenses, pre-batch investments, and income items. RBAC permissions enforced.
          </p>
        </div>

        {activeBatch && (
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
            Batch Context: <strong className="text-[#3b562b] font-mono">{activeBatch.batch_number}</strong>
          </div>
        )}
      </div>

      {!activeBatch ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-2xs">
          Please select an active batch contract to record ledger items.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 lg:col-span-1 h-fit shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Record Ledger Entry
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tx Type</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as FinancialType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none"
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                    <option value="Pre-Batch Expense">Pre-Batch Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tx Date</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Paid Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer"
              >
                Record Transaction
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden lg:col-span-2 shadow-2xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Ledger History</h3>
              <span className="text-xs text-slate-400 font-mono">Count: {financials.length}</span>
            </div>

            {financials.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No financial transactions logged for this batch contract.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Category / Description</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {financials.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-slate-500 font-mono">{tx.tx_date}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.tx_type === 'Expense'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {tx.tx_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{tx.category}</div>
                          <div className="text-[11px] text-slate-500">{tx.description}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-900 font-bold">
                          ₹{tx.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
