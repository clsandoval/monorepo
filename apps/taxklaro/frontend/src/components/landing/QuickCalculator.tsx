import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { computeTax } from '@/wasm/bridge'
import { createDefaultTaxpayerInput } from '@/types/engine-input'
import type { TaxComputationResult } from '@/types/engine-output'
import type { TaxpayerType } from '@/types/common'
import { formatPeso } from '@/lib/format'
import { Loader2 } from 'lucide-react'

const FREE_CALC_KEY = 'taxklaro_free_calc_used'

interface QuickCalcResult {
  recommended: string
  totalTax: string
  effectiveRate: string
  paths: Array<{
    label: string
    taxDue: string
    effectiveRate: string
  }>
  savings: string
}

function parseResult(result: TaxComputationResult): QuickCalcResult {
  const paths = result.comparison.map((p) => ({
    label: p.label,
    taxDue: formatPeso(p.totalTaxBurden),
    effectiveRate: p.effectiveRate,
  }))
  const rec = result.comparison.find(
    (p) => p.path === result.recommendedRegime
  )
  return {
    recommended: rec?.label ?? 'N/A',
    totalTax: formatPeso(result.selectedTotalTax),
    effectiveRate: rec?.effectiveRate ?? '0',
    paths,
    savings: formatPeso(result.savingsVsWorst),
  }
}

export function QuickCalculator({ onSignupGate }: { onSignupGate: () => void }) {
  const [grossReceipts, setGrossReceipts] = useState('')
  const [taxpayerType, setTaxpayerType] = useState<'PURELY_SE' | 'MIXED_INCOME'>('PURELY_SE')
  const [computing, setComputing] = useState(false)
  const [result, setResult] = useState<QuickCalcResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = async () => {
    // Check signup gate
    if (localStorage.getItem(FREE_CALC_KEY) === 'true') {
      onSignupGate()
      return
    }

    const amount = parseFloat(grossReceipts.replace(/,/g, ''))
    if (!amount || amount <= 0) {
      setError('Enter a valid amount')
      return
    }

    setComputing(true)
    setError(null)

    const input = createDefaultTaxpayerInput()
    input.taxpayerType = taxpayerType as TaxpayerType
    input.isMixedIncome = taxpayerType === 'MIXED_INCOME'
    input.grossReceipts = amount.toFixed(2)
    if (taxpayerType === 'MIXED_INCOME') {
      input.taxableCompensation = '0.00'
    }

    const wasmResult = await computeTax(input)
    setComputing(false)

    if (wasmResult.status === 'ok' && wasmResult.data) {
      setResult(parseResult(wasmResult.data))
      localStorage.setItem(FREE_CALC_KEY, 'true')
    } else {
      setError('Computation failed. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="grossReceipts" className="text-sm text-zinc-300">Annual Gross Receipts (₱)</Label>
          <Input
            id="grossReceipts"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 500,000"
            value={grossReceipts}
            onChange={(e) => setGrossReceipts(e.target.value)}
            className="h-11 bg-zinc-900 border-zinc-700 focus-visible:ring-zinc-600"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxpayerType" className="text-sm text-zinc-300">I am a...</Label>
          <Select value={taxpayerType} onValueChange={(v) => setTaxpayerType(v as 'PURELY_SE' | 'MIXED_INCOME')}>
            <SelectTrigger className="h-11 bg-zinc-900 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PURELY_SE">Freelancer / Self-Employed</SelectItem>
              <SelectItem value="MIXED_INCOME">Mixed Income (Employed + Freelance)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button onClick={handleCalculate} disabled={computing} className="w-full h-11">
          {computing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Calculating...</> : 'Calculate My Tax'}
        </Button>
      </div>

      {result && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <div className="text-center">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Recommended Regime</p>
            <p className="text-lg font-semibold text-zinc-50 mt-1">{result.recommended}</p>
            <p className="text-2xl font-bold text-zinc-50 mt-2">{result.totalTax}</p>
            <p className="text-xs text-zinc-500">estimated annual tax</p>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Compare All Options</p>
            <div className="space-y-2">
              {result.paths.map((p) => (
                <div key={p.label} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">{p.label}</span>
                  <span className="text-zinc-200 font-medium tabular-nums">{p.taxDue}</span>
                </div>
              ))}
            </div>
          </div>

          {result.savings !== '₱0.00' && (
            <p className="text-center text-sm text-green-400">
              You could save {result.savings}/year with the right regime.
            </p>
          )}

          <p className="text-center text-xs text-zinc-500 pt-2">
            Sign up to save results and run detailed computations.
          </p>
        </div>
      )}
    </div>
  )
}
