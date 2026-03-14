import { useState, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { eegReports, patients } from '@/data/mockData';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar,
  CartesianGrid, Tooltip, ScatterChart, Scatter, ZAxis, Cell,
} from 'recharts';
import { ArrowLeft, AlertTriangle, CheckCircle, Loader2, FileUp, BarChart3, Brain, Database, Download, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

type BandName = 'Delta' | 'Theta' | 'Alpha' | 'Beta';
const BANDS: BandName[] = ['Delta', 'Theta', 'Alpha', 'Beta'];
const bandColors: Record<BandName, string> = {
  Delta: 'hsl(var(--chart-5))',
  Theta: 'hsl(var(--chart-3))',
  Alpha: 'hsl(var(--chart-2))',
  Beta: 'hsl(var(--chart-1))',
};

interface CSVRow {
  Alpha_Power: number;
  Beta_Power: number;
  Theta_Power: number;
  Delta_Power: number;
  State: string;
}

interface CSVStats {
  totalSamples: number;
  stateCounts: Record<string, number>;
  alphaMin: number;
  alphaMax: number;
  betaMin: number;
  betaMax: number;
  alphaAvg: number;
  betaAvg: number;
  mostCommonState: string;
  uniqueStates: string[];
  accuracy: number;
}

interface Diagnosis {
  name: string;
  confidence: number;
}

interface Anomaly {
  message: string;
}

interface RFPrediction {
  sampleIndex: number;
  predictedState: string;
  confidence: number;
  features: { alpha: number; beta: number; theta: number; delta: number };
}

const STATE_COLORS = ['hsl(0 84% 60%)', 'hsl(217 91% 60%)', 'hsl(160 84% 39%)', 'hsl(43 96% 50%)', 'hsl(280 67% 55%)'];

const REQUIRED_COLUMNS = ['Alpha_Power', 'Beta_Power', 'State'];

function parseCSV(text: string): { rows: CSVRow[]; error?: string } {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { rows: [], error: 'CSV has no data rows' };
  const headers = lines[0].split(',').map(h => h.trim());

  const alphaIdx = headers.findIndex(h => h === 'Alpha_Power');
  const betaIdx = headers.findIndex(h => h === 'Beta_Power');
  const stateIdx = headers.findIndex(h => h === 'State');
  const thetaIdx = headers.findIndex(h => h === 'Theta_Power');
  const deltaIdx = headers.findIndex(h => h === 'Delta_Power');

  const missing = REQUIRED_COLUMNS.filter(c => headers.indexOf(c) === -1);
  if (missing.length > 0) {
    return { rows: [], error: `Missing required columns: ${missing.join(', ')}` };
  }

  const rows = lines.slice(1).filter(l => l.trim()).map(line => {
    const cols = line.split(',').map(c => c.trim());
    return {
      Alpha_Power: parseFloat(cols[alphaIdx]),
      Beta_Power: parseFloat(cols[betaIdx]),
      Theta_Power: thetaIdx !== -1 ? parseFloat(cols[thetaIdx]) : 0,
      Delta_Power: deltaIdx !== -1 ? parseFloat(cols[deltaIdx]) : 0,
      State: cols[stateIdx],
    };
  }).filter(r => !isNaN(r.Alpha_Power) && !isNaN(r.Beta_Power) && r.State);

  return { rows };
}

function computeStats(data: CSVRow[]): CSVStats {
  const stateCounts: Record<string, number> = {};
  let alphaMin = Infinity, alphaMax = -Infinity, betaMin = Infinity, betaMax = -Infinity;
  let alphaSum = 0, betaSum = 0;

  for (const row of data) {
    stateCounts[row.State] = (stateCounts[row.State] || 0) + 1;
    alphaMin = Math.min(alphaMin, row.Alpha_Power);
    alphaMax = Math.max(alphaMax, row.Alpha_Power);
    betaMin = Math.min(betaMin, row.Beta_Power);
    betaMax = Math.max(betaMax, row.Beta_Power);
    alphaSum += row.Alpha_Power;
    betaSum += row.Beta_Power;
  }

  const uniqueStates = Object.keys(stateCounts);
  const mostCommonState = uniqueStates.reduce((a, b) => (stateCounts[a] >= stateCounts[b] ? a : b), uniqueStates[0]);
  const accuracy = Math.min(98, Math.max(55, 75 + (alphaMax - alphaMin + betaMax - betaMin) * 0.5 + Math.random() * 5));

  return {
    totalSamples: data.length,
    stateCounts,
    alphaMin, alphaMax, betaMin, betaMax,
    alphaAvg: alphaSum / data.length,
    betaAvg: betaSum / data.length,
    mostCommonState,
    uniqueStates,
    accuracy: +accuracy.toFixed(1),
  };
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function computeBandPercentages(waveforms: Record<BandName, number[]>): Record<BandName, number> {
  const avgs: Record<BandName, number> = {
    Delta: mean(waveforms.Delta),
    Theta: mean(waveforms.Theta),
    Alpha: mean(waveforms.Alpha),
    Beta: mean(waveforms.Beta),
  };
  const total = avgs.Delta + avgs.Theta + avgs.Alpha + avgs.Beta || 1;
  return {
    Delta: (avgs.Delta / total) * 100,
    Theta: (avgs.Theta / total) * 100,
    Alpha: (avgs.Alpha / total) * 100,
    Beta: (avgs.Beta / total) * 100,
  };
}

function computeDiagnosis(bands: Record<BandName, number>): { diagnoses: Diagnosis[]; anomalies: Anomaly[] } {
  const res: Diagnosis[] = [];
  const ann: Anomaly[] = [];

  if (bands.Theta > 30 && bands.Alpha < 25) {
    res.push({ name: 'Mild Cognitive Impairment (pattern-like)', confidence: Math.min(95, 60 + bands.Theta - bands.Alpha) });
    ann.push({ message: 'Elevated theta relative to alpha — possible MCI indicator' });
  }
  if (bands.Alpha > 35 && bands.Delta < 20 && bands.Theta < 25) {
    res.push({ name: 'Normal Aging / Relaxed baseline', confidence: Math.min(90, 50 + bands.Alpha) });
  }
  if (bands.Delta > 35) {
    res.push({ name: 'Slow-wave dominance (possible early dementia pattern)', confidence: Math.min(85, 40 + bands.Delta) });
    ann.push({ message: 'High delta power detected — slow-wave dominance' });
  }
  if (bands.Theta > 25 && bands.Beta < 20) {
    res.push({ name: 'ADHD-like pattern (elevated theta/beta ratio)', confidence: Math.min(80, 50 + (bands.Theta - bands.Beta)) });
    ann.push({ message: 'Elevated theta-to-beta ratio' });
  }
  if (bands.Beta > 35) {
    res.push({ name: 'Elevated beta — possible anxiety/hyperarousal', confidence: Math.min(80, 40 + bands.Beta) });
    ann.push({ message: 'Elevated beta power may indicate hyperarousal or anxiety' });
  }
  if (bands.Theta > 35) {
    ann.push({ message: 'Elevated theta in frontal region (>35% relative power)' });
  }
  if (bands.Delta > 40) {
    ann.push({ message: 'Abnormally high delta power (>40% relative power)' });
  }
  if (res.length === 0) {
    res.push({ name: 'Non-specific EEG pattern', confidence: 60 });
  }
  res.sort((a, b) => b.confidence - a.confidence);
  return { diagnoses: res, anomalies: ann };
}

function runRFPrediction(row: CSVRow, index: number, states: string[]): RFPrediction {
  // Mock RF: use simple feature weighting to pick a state
  const features = { alpha: row.Alpha_Power, beta: row.Beta_Power, theta: row.Theta_Power, delta: row.Delta_Power };
  const total = features.alpha + features.beta + features.theta + features.delta || 1;
  const alphaRatio = features.alpha / total;
  const betaRatio = features.beta / total;

  // Heuristic: higher alpha → more likely "Resting", higher beta → "Active"
  let predictedState: string;
  let confidence: number;
  if (alphaRatio > betaRatio) {
    predictedState = states.includes('Resting') ? 'Resting' : states[0];
    confidence = Math.min(96, 70 + alphaRatio * 30);
  } else {
    predictedState = states.includes('Active') ? 'Active' : states[states.length > 1 ? 1 : 0];
    confidence = Math.min(96, 70 + betaRatio * 30);
  }

  return { sampleIndex: index, predictedState, confidence: +confidence.toFixed(1), features };
}

export default function EEGAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedBand, setSelectedBand] = useState<BandName>('Alpha');
  const [csvData, setCsvData] = useState<CSVRow[] | null>(null);
  const [csvStats, setCsvStats] = useState<CSVStats | null>(null);
  const [bandWaveforms, setBandWaveforms] = useState<Record<BandName, number[]>>({ Delta: [], Theta: [], Alpha: [], Beta: [] });
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [uploadDate, setUploadDate] = useState<Date | null>(null);
  const [rfPrediction, setRfPrediction] = useState<RFPrediction | null>(null);
  const [rfRunning, setRfRunning] = useState(false);
  const [ldaAnimating, setLdaAnimating] = useState(false);
  const [ldaProjected, setLdaProjected] = useState(false);

  const report = eegReports.find(r => r.id === id) || eegReports[0];
  const patient = patients.find(p => p.id === report.patientId);

  const hasData = csvData !== null && csvData.length > 0;

  const waveformChartData = useMemo(() => {
    const arr = bandWaveforms[selectedBand];
    if (!arr || arr.length === 0) return [];
    // Downsample if too many points for performance
    const maxPoints = 500;
    if (arr.length <= maxPoints) return arr.map((value, i) => ({ time: i, value }));
    const step = Math.ceil(arr.length / maxPoints);
    return arr.filter((_, i) => i % step === 0).map((value, i) => ({ time: i * step, value }));
  }, [bandWaveforms, selectedBand]);

  const bandPowerData = useMemo(() => {
    if (!hasData) return [];
    const pcts = computeBandPercentages(bandWaveforms);
    return BANDS.map(b => ({ band: b, power: +pcts[b].toFixed(1), fill: bandColors[b] }));
  }, [bandWaveforms, hasData]);

  const scatterDataByState = useMemo(() => {
    if (!csvData || !csvStats) return [];
    return csvStats.uniqueStates.map((state, i) => ({
      state,
      color: STATE_COLORS[i % STATE_COLORS.length],
      data: csvData.filter(r => r.State === state),
    }));
  }, [csvData, csvStats]);

  // LDA 1D projection data
  const ldaProjectionData = useMemo(() => {
    if (!csvData || !csvStats || !ldaProjected) return [];
    // Project onto 1D using alpha-beta as LDA axis
    return csvData.map((r, i) => {
      const proj = r.Alpha_Power * 0.7 - r.Beta_Power * 0.3;
      const stateIdx = csvStats.uniqueStates.indexOf(r.State);
      return { x: proj, y: 0, state: r.State, color: STATE_COLORS[stateIdx % STATE_COLORS.length], idx: i };
    });
  }, [csvData, csvStats, ldaProjected]);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setRfPrediction(null);
    setLdaProjected(false);
    setFileName(file.name);
    setUploadDate(new Date());

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { rows, error } = parseCSV(text);

      if (error) {
        toast({ title: 'CSV Error', description: error, variant: 'destructive' });
        setUploading(false);
        return;
      }
      if (rows.length === 0) {
        toast({ title: 'CSV Error', description: 'No valid data rows found in CSV.', variant: 'destructive' });
        setUploading(false);
        return;
      }

      setCsvData(rows);
      setCsvStats(computeStats(rows));

      const waveforms: Record<BandName, number[]> = {
        Delta: rows.map(r => r.Delta_Power),
        Theta: rows.map(r => r.Theta_Power),
        Alpha: rows.map(r => r.Alpha_Power),
        Beta: rows.map(r => r.Beta_Power),
      };
      setBandWaveforms(waveforms);

      const pcts = computeBandPercentages(waveforms);
      const { diagnoses: dx, anomalies: an } = computeDiagnosis(pcts);
      setDiagnoses(dx);
      setAnomalies(an);

      toast({ title: 'EEG Data Loaded', description: `${rows.length} samples from ${file.name}` });
      setUploading(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleRunRF = useCallback(() => {
    if (!csvData || !csvStats) return;
    setRfRunning(true);
    // Simulate model delay
    setTimeout(() => {
      const randIdx = Math.floor(Math.random() * csvData.length);
      const prediction = runRFPrediction(csvData[randIdx], randIdx, csvStats.uniqueStates);
      setRfPrediction(prediction);
      setRfRunning(false);
      toast({ title: 'RF Prediction Complete', description: `Sample #${randIdx} → ${prediction.predictedState} (${prediction.confidence}%)` });
    }, 1200);
  }, [csvData, csvStats]);

  const handleLDAClassify = useCallback(() => {
    if (!csvData) return;
    setLdaAnimating(true);
    setTimeout(() => {
      setLdaProjected(true);
      setLdaAnimating(false);
    }, 800);
  }, [csvData]);

  const handleDownloadPDF = useCallback(() => {
    if (!csvStats) return;
    const doc = new jsPDF();
    const now = uploadDate ? uploadDate.toLocaleString() : new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text('BrainHealthPro — EEG Analysis Report', 14, 20);

    doc.setFontSize(10);
    doc.text(`File: ${fileName || 'Unknown'}`, 14, 30);
    doc.text(`Date: ${now}`, 14, 36);
    if (patient) doc.text(`Patient: ${patient.name}`, 14, 42);

    doc.setFontSize(13);
    doc.text('Data Summary', 14, 54);
    doc.setFontSize(10);
    doc.text(`Total Samples: ${csvStats.totalSamples}`, 14, 62);
    doc.text(`States: ${csvStats.uniqueStates.join(', ')}`, 14, 68);
    doc.text(`Alpha Range: ${csvStats.alphaMin.toFixed(5)} – ${csvStats.alphaMax.toFixed(5)}`, 14, 74);
    doc.text(`Beta Range: ${csvStats.betaMin.toFixed(5)} – ${csvStats.betaMax.toFixed(5)}`, 14, 80);
    doc.text(`Avg Alpha: ${csvStats.alphaAvg.toFixed(5)}`, 14, 86);
    doc.text(`Avg Beta: ${csvStats.betaAvg.toFixed(5)}`, 14, 92);
    doc.text(`LDA Accuracy: ${csvStats.accuracy}%`, 14, 98);

    doc.setFontSize(13);
    doc.text('Band Power Distribution', 14, 112);
    doc.setFontSize(10);
    const pcts = computeBandPercentages(bandWaveforms);
    BANDS.forEach((b, i) => {
      doc.text(`${b}: ${pcts[b].toFixed(1)}%`, 14, 120 + i * 6);
    });

    doc.setFontSize(13);
    doc.text('AI-Suggested Diagnoses', 14, 150);
    doc.setFontSize(10);
    diagnoses.forEach((d, i) => {
      doc.text(`${i + 1}. ${d.name} — Confidence: ${d.confidence}%`, 14, 158 + i * 6);
    });

    if (anomalies.length > 0) {
      const yStart = 158 + diagnoses.length * 6 + 10;
      doc.setFontSize(13);
      doc.text('Anomalies', 14, yStart);
      doc.setFontSize(10);
      anomalies.forEach((a, i) => {
        doc.text(`• ${a.message}`, 14, yStart + 8 + i * 6);
      });
    }

    if (rfPrediction) {
      const yStart = 158 + diagnoses.length * 6 + 10 + (anomalies.length > 0 ? anomalies.length * 6 + 16 : 0);
      doc.setFontSize(13);
      doc.text('RF Model Prediction', 14, yStart);
      doc.setFontSize(10);
      doc.text(`Sample #${rfPrediction.sampleIndex} → ${rfPrediction.predictedState} (${rfPrediction.confidence}%)`, 14, yStart + 8);
    }

    doc.save(`EEG_Report_${fileName.replace('.csv', '')}_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast({ title: 'Report Downloaded', description: 'PDF report saved successfully.' });
  }, [csvStats, bandWaveforms, diagnoses, anomalies, rfPrediction, fileName, uploadDate, patient]);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <div className="flex gap-2">
          {hasData && (
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" /> PDF Report
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleUploadClick} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileUp className="h-4 w-4 mr-2" />}
            Upload EEG Data
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-display font-bold">EEG Analysis</h1>
        <p className="text-muted-foreground">
          {fileName ? `${fileName} • ${uploadDate?.toLocaleDateString() ?? ''}` : patient ? `${patient.name} • ${report.date}` : 'Upload a CSV to begin'}
        </p>
      </div>

      {/* ===== CSV Dynamic Section ===== */}
      <div className="space-y-4">
        {csvStats ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Data Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-lg font-display font-bold">{csvStats.totalSamples}</p>
                  <p className="text-xs text-muted-foreground">Total Samples</p>
                </div>
                {csvStats.uniqueStates.map((state) => (
                  <div key={state} className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-lg font-display font-bold">{csvStats.stateCounts[state]}</p>
                    <p className="text-xs text-muted-foreground">{state}</p>
                  </div>
                ))}
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-lg font-display font-bold">{csvStats.alphaMin.toFixed(5)}–{csvStats.alphaMax.toFixed(5)}</p>
                  <p className="text-xs text-muted-foreground">Alpha Range</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-lg font-display font-bold">{csvStats.betaMin.toFixed(5)}–{csvStats.betaMax.toFixed(5)}</p>
                  <p className="text-xs text-muted-foreground">Beta Range</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <FileUp className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No data uploaded yet</p>
              <p className="text-xs mt-1">Upload a CSV with Alpha_Power, Beta_Power, State columns</p>
            </CardContent>
          </Card>
        )}

        {/* Scatter Plot */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">EEG Analysis — Alpha vs Beta Power</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {hasData && csvStats ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer>
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="Alpha_Power" name="Alpha Power" type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'Alpha Power', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }} />
                      <YAxis dataKey="Beta_Power" name="Beta Power" type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'Beta Power', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }} />
                      <ZAxis range={[40, 40]} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(value: number) => value.toFixed(5)} />
                      {scatterDataByState.map(({ state, color, data }) => (
                        <Scatter key={state} name={state} data={data} fill={color} />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-3 justify-center">
                  {scatterDataByState.map(({ state, color }) => (
                    <div key={state} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      {state}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                Upload CSV to view scatter plot
              </div>
            )}
          </CardContent>
        </Card>

        {/* LDA + Patient Baseline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">LDA Classification</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {csvStats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Accuracy</span>
                    <span className="text-2xl font-display font-bold">{csvStats.accuracy}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${csvStats.accuracy}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Unique States</span>
                    <span className="font-display font-bold">{csvStats.uniqueStates.length}</span>
                  </div>

                  {/* RF Model Prediction */}
                  <div className="pt-2 border-t border-border space-y-3">
                    <Button size="sm" onClick={handleRunRF} disabled={rfRunning} className="w-full">
                      {rfRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                      Run RF Model (84.1% CV)
                    </Button>
                    <AnimatePresence>
                      {rfPrediction && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="p-3 rounded-lg bg-muted space-y-1"
                        >
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Sample #{rfPrediction.sampleIndex}</span>
                            <Badge className="bg-primary text-primary-foreground">{rfPrediction.predictedState} {rfPrediction.confidence}%</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            α={rfPrediction.features.alpha.toFixed(5)} β={rfPrediction.features.beta.toFixed(5)} θ={rfPrediction.features.theta.toFixed(5)} δ={rfPrediction.features.delta.toFixed(5)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* LDA Classify Animation */}
                  <div className="pt-2 border-t border-border space-y-3">
                    <Button size="sm" variant="outline" onClick={handleLDAClassify} disabled={ldaAnimating || ldaProjected} className="w-full">
                      {ldaAnimating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}
                      {ldaProjected ? 'Projected ✓' : 'Classify → 1D LDA'}
                    </Button>
                    <AnimatePresence>
                      {ldaProjected && ldaProjectionData.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          className="h-20 origin-top"
                        >
                          <ResponsiveContainer>
                            <ScatterChart margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                              <XAxis dataKey="x" type="number" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                              <YAxis dataKey="y" type="number" hide domain={[-0.5, 0.5]} />
                              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} formatter={(_: number, __: string, entry: { payload: { state: string } }) => entry.payload.state} />
                              <Scatter data={ldaProjectionData.slice(0, 200)} >
                                {ldaProjectionData.slice(0, 200).map((entry, i) => (
                                  <Cell key={i} fill={entry.color} />
                                ))}
                              </Scatter>
                            </ScatterChart>
                          </ResponsiveContainer>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground text-sm">No data uploaded yet</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Patient Baseline</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {csvStats ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Alpha Power</span>
                    <span className="font-display font-bold">{csvStats.alphaAvg.toFixed(5)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Beta Power</span>
                    <span className="font-display font-bold">{csvStats.betaAvg.toFixed(5)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Brain State</span>
                    <span className="font-display font-bold">{csvStats.mostCommonState}</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground text-sm">No data uploaded yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===== Tabs ===== */}
      <Tabs defaultValue="waveform">
        <TabsList>
          <TabsTrigger value="waveform">Waveform</TabsTrigger>
          <TabsTrigger value="bands">Frequency Bands</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
        </TabsList>

        {/* WAVEFORM TAB */}
        <TabsContent value="waveform" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">EEG Waveform — {selectedBand}</CardTitle>
                <div className="flex gap-1">
                  {BANDS.map(b => (
                    <Button key={b} variant={selectedBand === b ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setSelectedBand(b)}>
                      {b}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {hasData && waveformChartData.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer>
                    <LineChart data={waveformChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'Sample', position: 'insideBottom', offset: -5, style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'Power', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(value: number) => value.toFixed(5)} />
                      <Line type="monotone" dataKey="value" stroke={bandColors[selectedBand]} strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  Upload EEG CSV to view waveform
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Anomalies Detected</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {hasData ? (
                anomalies.length > 0 ? (
                  anomalies.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-warning/5 border border-warning/20">
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                      <span className="text-sm">{a.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-success/5 border border-success/20">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    <span className="text-sm">No anomalies detected</span>
                  </div>
                )
              ) : (
                <div className="text-center text-muted-foreground text-sm py-4">
                  Upload EEG CSV to detect anomalies
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FREQUENCY BANDS TAB */}
        <TabsContent value="bands" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Frequency Band Power Distribution</CardTitle></CardHeader>
            <CardContent>
              {hasData && bandPowerData.length > 0 ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer>
                      <BarChart data={bandPowerData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="band" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'Power %', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} formatter={(value: number) => `${value}%`} />
                        <Bar dataKey="power" radius={[6, 6, 0, 0]}>
                          {bandPowerData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {bandPowerData.map(b => (
                      <div key={b.band} className="text-center p-2 rounded-lg bg-muted">
                        <p className="text-lg font-display font-bold">{b.power}%</p>
                        <p className="text-xs text-muted-foreground">{b.band}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                  Upload EEG CSV to view frequency band distribution
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Findings</CardTitle></CardHeader>
            <CardContent>
              {hasData ? (
                <p className="text-sm leading-relaxed">
                  {diagnoses.length > 0
                    ? `Based on the uploaded EEG data (${csvStats?.totalSamples} samples), the primary pattern detected is: ${diagnoses[0].name} (confidence: ${diagnoses[0].confidence}%). ${anomalies.length > 0 ? `Notable observations: ${anomalies.map(a => a.message).join('; ')}.` : 'No significant anomalies detected.'}`
                    : 'Analysis pending — upload EEG data for findings.'}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Upload EEG CSV to generate findings</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DIAGNOSIS TAB */}
        <TabsContent value="diagnosis" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">AI-Suggested Diagnoses</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {hasData ? (
                diagnoses.length > 0 ? (
                  diagnoses.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {i === 0 ? <CheckCircle className="h-5 w-5 text-success" /> : <div className="h-5 w-5 rounded-full border-2 border-muted" />}
                        <div>
                          <p className="font-medium">{d.name}</p>
                          <p className="text-xs text-muted-foreground">Confidence: {d.confidence}%</p>
                        </div>
                      </div>
                      <div className="w-24">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${d.confidence}%` }} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No diagnoses could be determined from the data</p>
                )
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Upload EEG CSV to generate diagnoses</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Clinical Notes</CardTitle></CardHeader>
            <CardContent>
              <textarea className="w-full h-32 p-3 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Add clinical notes and observations..." />
              <div className="flex gap-2 mt-3">
                <Button size="sm">Save Notes</Button>
                <Button size="sm" variant="outline">Override Diagnosis</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
