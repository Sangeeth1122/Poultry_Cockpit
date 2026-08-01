'use client';

import React, { useState } from 'react';
import {
  Layers,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Save,
  Plus,
  Trash2,
  Upload,
  FileText,
  DollarSign,
  Scale,
  Calendar,
  Building2,
  Package,
} from 'lucide-react';
import { BatchRecord, ShedRecord, UserRole, LiftingRecord, FinancialTransactionRecord } from '../../types';
import { BusinessEngine } from '../../engine';

interface BatchWizardProps {
  sheds: ShedRecord[];
  farmId: string;
  userRole: UserRole;
  userId: string;
  onSaveBatch: (batch: Omit<BatchRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onBackToList: () => void;
  onLiftingSaved?: (lifting: Omit<LiftingRecord, 'id' | 'created_at' | 'updated_at' | 'avg_weight_kg'>) => Promise<void>;
  onFinancialSaved?: (tx: Omit<FinancialTransactionRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function BatchWizard({
  sheds,
  farmId,
  userRole,
  userId,
  onSaveBatch,
  onBackToList,
  onLiftingSaved,
  onFinancialSaved,
}: BatchWizardProps) {
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Stage 1: Shed Readiness State
  const [shedId, setShedId] = useState<string>(sheds[0]?.id || 'shed-001');
  const [readinessChecklist, setReadinessChecklist] = useState({
    removeLitter: true,
    washShed: true,
    disinfect: true,
    dryPeriod: true,
    equipmentCheck: true,
    waterLineFlush: true,
    feedersInstalled: true,
    broodersTested: true,
    curtainsVentilation: true,
  });

  // Pre-batch Expenses State
  const [preExpenses, setPreExpenses] = useState([
    { id: '1', date: '2024-04-12', category: 'Shed Preparation', desc: 'Disinfection & cleaning labor', amount: 8500 },
    { id: '2', date: '2024-04-14', category: 'Litter Material', desc: 'Rice husk 50 bags', amount: 10000 },
  ]);
  const [newExpCat, setNewExpCat] = useState('Shed Preparation');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpAmt, setNewExpAmt] = useState<number>(0);

  // Stage 2: Batch Setup State
  const [batchNumber, setBatchNumber] = useState(`BAT-${Date.now().toString().slice(-4)}`);
  const [companyName, setCompanyName] = useState('Suguna Foods Ltd');
  const [batchType, setBatchType] = useState<'Broiler' | 'Breeder' | 'Layer'>('Broiler');
  const [breed, setBreed] = useState('Cobb 500');
  const [placementDate, setPlacementDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDays, setTargetDays] = useState(42);
  const [formulaProfile, setFormulaProfile] = useState('Broiler Standard v1.0');
  const [supplierName, setSupplierName] = useState('Central Hatcheries');

  // Stage 3: Place Chicks State
  const [chicksPlaced, setChicksPlaced] = useState(4000);
  const [chickCost, setChickCost] = useState(38);
  const [mortalityArrival, setMortalityArrival] = useState(5);
  const [avgChickWeight, setAvgChickWeight] = useState(42);
  const [notes, setNotes] = useState('Standard chick placement in Shed 01.');

  // Stage 4 State
  const [areAllChicksLifted, setAreAllChicksLifted] = useState(false);

  // Stage 5 State: Liftings
  const [wizardLiftings, setWizardLiftings] = useState<Array<{
    id: string;
    no: number;
    date: string;
    birds: number;
    weight: number;
    buyer: string;
    vehicle: string;
  }>>([
    { id: 'l1', no: 1, date: new Date().toISOString().split('T')[0], birds: 1800, weight: 3780, buyer: 'Local Market', vehicle: 'TN-38-AX-1029' }
  ]);
  const [newLiftDate, setNewLiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLiftBirds, setNewLiftBirds] = useState(1500);
  const [newLiftWeight, setNewLiftWeight] = useState(3150);
  const [newLiftBuyer, setNewLiftBuyer] = useState('Poultry Corp');
  const [newLiftVehicle, setNewLiftVehicle] = useState('TN-38-BY-9012');
  const [confirmFinalLifting, setConfirmFinalLifting] = useState(false);

  // Stage 6 State: Financials
  const [wizardTxs, setWizardTxs] = useState<Array<{
    id: string;
    date: string;
    type: 'Expense' | 'Income';
    category: string;
    desc: string;
    amount: number;
  }>>([
    { id: 't1', date: '2024-04-15', type: 'Expense', category: 'Feed', desc: 'Starter Feed 50 Bags', amount: 62500 },
    { id: 't2', date: '2024-05-10', type: 'Income', category: 'Lifting Revenue', desc: 'First Lifting Payment', amount: 310000 },
  ]);
  const [newTxType, setNewTxType] = useState<'Expense' | 'Income'>('Expense');
  const [newTxCat, setNewTxCat] = useState('Feed');
  const [newTxDesc, setNewTxDesc] = useState('');
  const [newTxAmt, setNewTxAmt] = useState(0);

  // Stage 7 State: Final Settlement
  const [settlementAdditions, setSettlementAdditions] = useState([
    { id: 'a1', desc: 'Growing Charges', amount: 395000 },
    { id: 'a2', desc: 'Performance Incentive', amount: 18500 },
  ]);
  const [settlementDeductions, setSettlementDeductions] = useState([
    { id: 'd1', desc: 'Transport Deduction', amount: 6200 },
    { id: 'd2', desc: 'Medicine Deduction', amount: 2500 },
  ]);
  const [newAddComponent, setNewAddComponent] = useState('');
  const [newAddAmount, setNewAddAmount] = useState(0);
  const [newDedComponent, setNewDedComponent] = useState('');
  const [newDedAmount, setNewDedAmount] = useState(0);

  const stagesList = [
    { stage: 1, title: '1. Shed Readiness' },
    { stage: 2, title: '2. Batch Setup' },
    { stage: 3, title: '3. Place Chicks' },
    { stage: 4, title: '4. Running' },
    { stage: 5, title: '5. Liftings' },
    { stage: 6, title: '6. Financial Entry' },
    { stage: 7, title: '7. Final Settlement' },
    { stage: 8, title: '8. Archive' },
  ];

  const handleAddPreExpense = () => {
    if (!newExpDesc || newExpAmt <= 0) return;
    setPreExpenses((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        category: newExpCat,
        desc: newExpDesc,
        amount: newExpAmt,
      },
    ]);
    setNewExpDesc('');
    setNewExpAmt(0);
  };

  const handleRemovePreExpense = (id: string) => {
    setPreExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleNextStage = (target: number) => {
    setErrorMsg(null);
    try {
      BusinessEngine.validateStageTransition(userRole, currentStage, target);
      setCurrentStage(target);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    }
  };

  const handleFinishWizard = async () => {
    setErrorMsg(null);
    try {
      BusinessEngine.validateBatchCreation(userRole, false, placementDate);

      await onSaveBatch({
        batch_number: batchNumber,
        farm_id: farmId,
        shed_id: shedId,
        company_name: companyName,
        batch_type: batchType,
        breed,
        placement_date: placementDate,
        target_days_in_house: targetDays,
        chicks_placed: chicksPlaced,
        chick_cost_per_bird: chickCost,
        supplier_name: supplierName,
        formula_profile: formulaProfile,
        status: 'Running',
        current_stage: 4,
        notes,
        created_by: userId,
        updated_by: userId,
      });

      onBackToList();
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToList}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xs font-semibold text-slate-400">Batch Setup Wizard</div>
            <h1 className="text-base font-extrabold text-slate-900">
              New Batch Creation - Stage {currentStage}
            </h1>
          </div>
        </div>

        <button
          onClick={handleFinishWizard}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save & Start Running</span>
        </button>
      </div>

      {/* Stepper Bar (Exact Stitch UI Design) */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[750px] gap-2">
          {stagesList.map((item) => {
            const isCompleted = item.stage < currentStage;
            const isActive = item.stage === currentStage;

            return (
              <div
                key={item.stage}
                onClick={() => {
                  if (item.stage <= currentStage + 1) handleNextStage(item.stage);
                }}
                className={`flex-1 py-2 px-3 rounded-xl border text-center transition cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#3b562b] text-white border-[#3b562b] shadow-2xs font-bold'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                    : 'bg-slate-50 text-slate-400 border-slate-200 text-xs font-medium'
                }`}
              >
                <div className="text-[11px] truncate flex items-center justify-center gap-1">
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                  <span>{item.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start gap-2 shadow-2xs">
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Stage 1: Shed Readiness */}
      {currentStage === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Checklist Box */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">
                1. Shed Readiness Checklist (Shed 01 / Shed 02)
              </h2>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Shed</label>
                <select
                  value={shedId}
                  onChange={(e) => setShedId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:border-[#3b562b] outline-none"
                >
                  {sheds.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.capacity.toLocaleString()} Capacity)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'removeLitter', label: 'Remove old litter completely' },
                  { key: 'washShed', label: 'High pressure wash shed walls & floor' },
                  { key: 'disinfect', label: 'Apply approved disinfectant spray' },
                  { key: 'dryPeriod', label: 'Ensure 10-day dry period prior to placement' },
                  { key: 'equipmentCheck', label: 'Check curtains, fans, and brooders' },
                  { key: 'waterLineFlush', label: 'Flush water lines & test nipples' },
                  { key: 'feedersInstalled', label: 'Clean chick feeders & place chick paper' },
                  { key: 'broodersTested', label: 'Test brooders & adjust temperature to 32°C' },
                  { key: 'curtainsVentilation', label: 'Calibrate curtain ventilation controls' },
                ].map((task) => {
                  const checked = (readinessChecklist as Record<string, boolean>)[task.key];
                  return (
                    <label
                      key={task.key}
                      className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl cursor-pointer hover:bg-slate-100/80 transition"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setReadinessChecklist((prev) => ({
                            ...prev,
                            [task.key]: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-[#3b562b] rounded focus:ring-0"
                      />
                      <span className="text-xs font-medium text-slate-800">{task.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Pre-Batch Expenses Section */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Pre-Batch Preparation Expenses</span>
                <span className="text-xs font-mono text-[#3b562b]">
                  Total: ₹{preExpenses.reduce((acc, e) => acc + e.amount, 0).toLocaleString()}
                </span>
              </h2>

              <div className="space-y-3 mb-4">
                {preExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{exp.category}</span>
                      <p className="text-[11px] text-slate-500">{exp.desc}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">
                        ₹{exp.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleRemovePreExpense(exp.id)}
                        className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Expense Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-3 border-t border-slate-100">
                <select
                  value={newExpCat}
                  onChange={(e) => setNewExpCat(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                >
                  <option value="Shed Preparation">Shed Preparation</option>
                  <option value="Litter Material">Litter Material</option>
                  <option value="Disinfection">Disinfection</option>
                  <option value="Chick Transport">Chick Transport</option>
                  <option value="Others">Others</option>
                </select>

                <input
                  type="text"
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  placeholder="Expense description..."
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                />

                <input
                  type="number"
                  value={newExpAmt || ''}
                  onChange={(e) => setNewExpAmt(Number(e.target.value))}
                  placeholder="Amount (₹)"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none font-mono"
                />

                <button
                  type="button"
                  onClick={handleAddPreExpense}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Summary Panel */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                Stage 1 Status
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Verify shed readiness tasks and record all pre-batch setup expenses before proceeding to Stage 2 Batch Setup.
              </p>

              <button
                onClick={() => handleNextStage(2)}
                className="w-full py-3 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Mark as Shed Ready → Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage 2: Batch Setup */}
      {currentStage === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">
              2. Batch Specification & Company Profile
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-[#3b562b] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company / Integrator</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:border-[#3b562b] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch Type</label>
                <select
                  value={batchType}
                  onChange={(e) => setBatchType(e.target.value as 'Broiler' | 'Breeder' | 'Layer')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none"
                >
                  <option value="Broiler">Broiler</option>
                  <option value="Breeder">Breeder</option>
                  <option value="Layer">Layer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chick Breed</label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Placement Date</label>
                <input
                  type="date"
                  value={placementDate}
                  onChange={(e) => setPlacementDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-[#3b562b] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Formula Profile</label>
                <input
                  type="text"
                  value={formulaProfile}
                  onChange={(e) => setFormulaProfile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-[#3b562b] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier / Hatchery</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#3b562b] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                Stage 2 Validation
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Confirm batch contract metadata before proceeding to Chick Placement.
              </p>

              <button
                onClick={() => handleNextStage(3)}
                className="w-full py-3 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Place Chicks →</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage 3: Place Chicks */}
      {currentStage === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">
              3. Chick Arrival & Placement Details
            </h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chicks Placed</label>
                <input
                  type="number"
                  value={chicksPlaced}
                  onChange={(e) => setChicksPlaced(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:border-[#3b562b] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chick Cost (₹/bird)</label>
                <input
                  type="number"
                  step="0.1"
                  value={chickCost}
                  onChange={(e) => setChickCost(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-[#3b562b] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mortality on Arrival</label>
                <input
                  type="number"
                  value={mortalityArrival}
                  onChange={(e) => setMortalityArrival(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-[#3b562b] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Avg Chick Weight (g)</label>
                <input
                  type="number"
                  value={avgChickWeight}
                  onChange={(e) => setAvgChickWeight(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-[#3b562b] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Days in House</label>
                <input
                  type="number"
                  value={targetDays}
                  onChange={(e) => setTargetDays(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-[#3b562b] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Placement Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Placement notes or remarks..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-[#3b562b] outline-none"
              ></textarea>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                Live Placement Summary
              </h3>
              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Batch ID:</span>
                  <span className="font-mono font-bold text-slate-900">{batchNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Company:</span>
                  <span className="font-bold text-slate-900">{companyName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Chicks:</span>
                  <span className="font-mono font-bold text-[#3b562b]">
                    {chicksPlaced.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Placement Date:</span>
                  <span className="font-mono text-slate-800">{placementDate}</span>
                </div>
              </div>

              <button
                onClick={handleFinishWizard}
                className="w-full py-3 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save & Start Running</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage 4: Running */}
      {currentStage === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Live Snapshot Stat Cards */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>4. Daily Performance & Complete Batch Operations</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-extrabold uppercase">
                    Daily Logs: Active
                  </span>
                </h2>
                <span className="text-xs font-mono font-bold text-slate-500">Day 10 / {targetDays} Days</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Birds Placed</span>
                  <span className="text-base font-black text-slate-900 font-mono">{chicksPlaced.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Mortality</span>
                  <span className="text-base font-black text-rose-600 font-mono">{mortalityArrival + 12}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Live Birds</span>
                  <span className="text-base font-black text-emerald-700 font-mono">{(chicksPlaced - mortalityArrival - 12).toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Weight</span>
                  <span className="text-base font-black text-slate-900 font-mono">0.420 kg</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Daily Gain</span>
                  <span className="text-base font-black text-slate-900 font-mono">42.0 g</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Cum. FCR</span>
                  <span className="text-base font-black text-[#3b562b] font-mono">1.18</span>
                </div>
              </div>
            </div>

            {/* Complete Batch Operations Box */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                Complete Batch Operations
              </h3>

              <div className="space-y-3 text-xs">
                <p className="font-bold text-slate-800">Are all chicks lifted from the shed?</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="lifted"
                      checked={!areAllChicksLifted}
                      onChange={() => setAreAllChicksLifted(false)}
                      className="text-[#3b562b]"
                    />
                    <span className="font-medium text-slate-700">No, birds are still in shed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="lifted"
                      checked={areAllChicksLifted}
                      onChange={() => setAreAllChicksLifted(true)}
                      className="text-[#3b562b]"
                    />
                    <span className="font-medium text-slate-700">Yes, all birds have been lifted</span>
                  </label>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-600 text-[11px]">
                  <p className="font-bold text-slate-900">Completing batch operations will:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Lock daily log entries for this batch</li>
                    <li>Move current stage to Stage 5: Liftings</li>
                    <li>Calculate final feed and water consumption metrics</li>
                  </ul>
                </div>

                <button
                  onClick={() => setCurrentStage(5)}
                  className="w-full py-3 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Complete Batch Operations → Next (Stage 5 Liftings)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Summary */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Running Summary</h3>
              <p className="text-xs text-slate-500">
                Track daily feed, water, and mortality parameters during the growth period.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stage 5: Liftings */}
      {currentStage === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Form: Record New Lifting */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                5. Record Bird Lifting Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lifting Date</label>
                  <input
                    type="date"
                    value={newLiftDate}
                    onChange={(e) => setNewLiftDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Birds Lifted</label>
                  <input
                    type="number"
                    value={newLiftBirds}
                    onChange={(e) => setNewLiftBirds(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Weight (kg)</label>
                  <input
                    type="number"
                    value={newLiftWeight}
                    onChange={(e) => setNewLiftWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Avg Weight (Calculated)</label>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold">
                    {newLiftBirds > 0 ? (newLiftWeight / newLiftBirds).toFixed(2) : 0} kg
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Buyer / Processing Plant</label>
                  <input
                    type="text"
                    value={newLiftBuyer}
                    onChange={(e) => setNewLiftBuyer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle No.</label>
                  <input
                    type="text"
                    value={newLiftVehicle}
                    onChange={(e) => setNewLiftVehicle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono outline-none"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (newLiftBirds <= 0) return;
                  setWizardLiftings((prev) => [
                    ...prev,
                    {
                      id: `lft-${Date.now()}`,
                      no: prev.length + 1,
                      date: newLiftDate,
                      birds: newLiftBirds,
                      weight: newLiftWeight,
                      buyer: newLiftBuyer,
                      vehicle: newLiftVehicle,
                    },
                  ]);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Lifting Record</span>
              </button>
            </div>

            {/* Liftings Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Liftings History ({wizardLiftings.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Lifting #</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Buyer / Vehicle</th>
                      <th className="px-4 py-3 text-right">Birds Lifted</th>
                      <th className="px-4 py-3 text-right">Total Wt (kg)</th>
                      <th className="px-4 py-3 text-right">Avg Wt (kg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {wizardLiftings.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-mono font-bold text-[#3b562b]">#{l.no}</td>
                        <td className="px-4 py-3 font-mono text-slate-600">{l.date}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{l.buyer} ({l.vehicle})</td>
                        <td className="px-4 py-3 text-right font-mono font-bold">{l.birds.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-900">{l.weight.toLocaleString()} kg</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-700 font-bold">
                          {(l.weight / l.birds).toFixed(2)} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Final Lifting Confirmation */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmFinalLifting}
                  onChange={(e) => setConfirmFinalLifting(e.target.checked)}
                  className="w-4 h-4 text-[#3b562b] rounded"
                />
                <span className="text-xs font-bold text-slate-800">
                  No more birds remaining in the shed. Confirm final lifting and complete this stage.
                </span>
              </label>

              <button
                onClick={() => setCurrentStage(6)}
                disabled={!confirmFinalLifting && wizardLiftings.length === 0}
                className="w-full py-3 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>Confirm Final Lifting & Move to Stage 6 (Financial Entry) →</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-3 text-xs">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Liftings Summary</h3>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Liftings:</span>
                <span className="font-mono font-bold text-slate-900">{wizardLiftings.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Birds Lifted:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {wizardLiftings.reduce((a, b) => a + b.birds, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Weight:</span>
                <span className="font-mono font-bold text-slate-900">
                  {wizardLiftings.reduce((a, b) => a + b.weight, 0).toLocaleString()} kg
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage 6: Financial Entry */}
      {currentStage === 6 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                6. Internal Financial Ledger
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <select
                  value={newTxType}
                  onChange={(e) => setNewTxType(e.target.value as 'Expense' | 'Income')}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold outline-none"
                >
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>

                <select
                  value={newTxCat}
                  onChange={(e) => setNewTxCat(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                >
                  <option value="Feed">Feed</option>
                  <option value="Chick">Chick</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Labour">Labour</option>
                  <option value="Lifting Revenue">Lifting Revenue</option>
                  <option value="Others">Others</option>
                </select>

                <input
                  type="text"
                  placeholder="Transaction description..."
                  value={newTxDesc}
                  onChange={(e) => setNewTxDesc(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                />

                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={newTxAmt || ''}
                  onChange={(e) => setNewTxAmt(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono outline-none"
                />
              </div>

              <button
                onClick={() => {
                  if (newTxAmt <= 0) return;
                  setWizardTxs((prev) => [
                    ...prev,
                    {
                      id: `tx-${Date.now()}`,
                      date: new Date().toISOString().split('T')[0],
                      type: newTxType,
                      category: newTxCat,
                      desc: newTxDesc || 'Batch ledger entry',
                      amount: newTxAmt,
                    },
                  ]);
                  setNewTxDesc('');
                  setNewTxAmt(0);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ledger Transaction</span>
              </button>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5">Description</th>
                      <th className="px-4 py-2.5 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {wizardTxs.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-2.5 font-mono text-slate-600">{t.date}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.type === 'Income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-900">{t.category}</td>
                        <td className="px-4 py-2.5 text-slate-600">{t.desc}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                          ₹ {t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => setCurrentStage(7)}
                className="w-full py-3 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <span>Proceed to Stage 7 (Final Settlement) →</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-3 text-xs">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Financial Summary</h3>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Expenses:</span>
                <span className="font-mono font-bold text-rose-600">
                  ₹ {wizardTxs.filter((t) => t.type === 'Expense').reduce((a, b) => a + b.amount, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Income:</span>
                <span className="font-mono font-bold text-emerald-700">
                  ₹ {wizardTxs.filter((t) => t.type === 'Income').reduce((a, b) => a + b.amount, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage 7: Final Settlement */}
      {currentStage === 7 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4 text-xs">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex justify-between items-center">
                <span>7. Final Settlement Record</span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold">
                  Grade A+
                </span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase text-[10px]">Growing Charges (GC)</h4>
                  <div className="flex justify-between">
                    <span>GC Rate:</span>
                    <span className="font-mono font-bold">₹ 9.25 / kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight Lifted:</span>
                    <span className="font-mono font-bold">8,302 kg</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-extrabold border-t border-slate-200 pt-1">
                    <span>Total GC:</span>
                    <span className="font-mono">₹ 76,793.50</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase text-[10px]">Settlement Overview</h4>
                  <div className="flex justify-between">
                    <span>Additions:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      ₹ {settlementAdditions.reduce((a, b) => a + b.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deductions:</span>
                    <span className="font-mono font-bold text-rose-600">
                      ₹ {settlementDeductions.reduce((a, b) => a + b.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#3b562b] font-black border-t border-slate-200 pt-1 text-sm">
                    <span>Net Settlement:</span>
                    <span className="font-mono">
                      ₹ {(
                        settlementAdditions.reduce((a, b) => a + b.amount, 0) -
                        settlementDeductions.reduce((a, b) => a + b.amount, 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinishWizard}
                className="w-full py-3 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <Save className="w-4 h-4" />
                <span>Complete Final Settlement & Save Batch Contract</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs text-xs space-y-3">
              <h3 className="font-extrabold text-slate-900 uppercase">Settlement Info</h3>
              <p className="text-slate-500">
                Final settlement matches company contract records with actual shed performance and lifting returns.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stage 8: Archive */}
      {currentStage === 8 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-2xs text-center space-y-4 font-sans">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900">Batch Completed & Moved to Archive</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            This batch has been archived and is now read-only.
          </p>
          <button
            onClick={onBackToList}
            className="px-6 py-2.5 bg-[#3b562b] hover:bg-[#324b24] text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer"
          >
            Return to Batch List
          </button>
        </div>
      )}
    </div>
  );
}
