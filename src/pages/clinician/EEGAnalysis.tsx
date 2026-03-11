import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { eegReports, generateEEGWaveform, patients } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip } from 'recharts';
import { ArrowLeft, AlertTriangle, CheckCircle, Upload, Loader2 } from 'lucide-react';

const BANDS = ['delta', 'theta', 'alpha', 'beta'] as const;
const bandColors: Record<string, string> = {
  delta: 'hsl(var(--chart-5))',
  theta: 'hsl(var(--chart-3))',
  alpha: 'hsl(var(--chart-2))',
  beta: 'hsl(var(--chart-1))',
};

export default function EEGAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [selectedBand, setSelectedBand] = useState<typeof BANDS[number]>('alpha');

  const report = eegReports.find(r => r.id === id) || eegReports[0];
  const patient = patients.find(p => p.id === report.patientId);

  const waveformData = generateEEGWaveform(selectedBand);
  const bandPowerData = BANDS.map(b => ({ band: b, power: report.bands[b], fill: bandColors[b] }));

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => setUploading(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <Button variant="outline" size="sm" onClick={handleUpload} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload EEG
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-display font-bold">EEG Analysis</h1>
        {patient && <p className="text-muted-foreground">{patient.name} • {report.date}</p>}
      </div>

      <Tabs defaultValue="waveform">
        <TabsList>
          <TabsTrigger value="waveform">Waveform</TabsTrigger>
          <TabsTrigger value="bands">Frequency Bands</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
        </TabsList>

        <TabsContent value="waveform" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">EEG Waveform — {selectedBand.charAt(0).toUpperCase() + selectedBand.slice(1)}</CardTitle>
                <div className="flex gap-1">
                  {BANDS.map(b => (
                    <Button key={b} variant={selectedBand === b ? 'default' : 'outline'} size="sm" className="text-xs capitalize" onClick={() => setSelectedBand(b)}>
                      {b}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer>
                  <LineChart data={waveformData}>
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <Line type="monotone" dataKey="value" stroke={bandColors[selectedBand]} strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Anomalies */}
          <Card>
            <CardHeader><CardTitle className="text-base">Anomalies Detected</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {report.anomalies.map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-warning/5 border border-warning/20">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                  <span className="text-sm">{a}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bands" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Frequency Band Power Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={bandPowerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="band" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'Power %', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Bar dataKey="power" radius={[6, 6, 0, 0]}>
                      {bandPowerData.map((entry, i) => (
                        <rect key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-4">
                {bandPowerData.map(b => (
                  <div key={b.band} className="text-center p-2 rounded-lg bg-muted">
                    <p className="text-lg font-display font-bold">{b.power}%</p>
                    <p className="text-xs text-muted-foreground capitalize">{b.band}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Findings</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed">{report.findings}</p></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnosis" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">AI-Suggested Diagnoses</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {report.suggestedDiagnoses.map((d, i) => (
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
              ))}
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
