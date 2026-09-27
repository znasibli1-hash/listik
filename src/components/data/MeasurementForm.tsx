import { useMemo, useState, type FormEvent } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/Button';
import { InputField, Label, Segmented, SelectField } from '@/components/ui/Field';
import { DISTRICT_IDS } from '@/data/districts';
import { checkQuality } from '@/utils/dataQuality';
import { nowTime, slugify, todayIso } from '@/utils/format';
import type { ClassType, NewMeasurement, Ventilation } from '@/types';

/** Raw form state: numbers stay strings until validation. */
interface FormState {
  schoolName: string; district: string; date: string; time: string; className: string; type: ClassType;
  students: string; plants: string; co2: string; temperature: string; humidity: string; ventilation: Ventilation; notes: string;
}
type Errors = Partial<Record<keyof FormState, string>>;

const initial = (): FormState => ({
  schoolName: '', district: '', date: todayIso(), time: nowTime(), className: '', type: 'experimental',
  students: '', plants: '', co2: '', temperature: '', humidity: '', ventilation: 'no', notes: '',
});

const toNumber = (s: string) => (s.trim() === '' ? null : Number(s.replace(',', '.')));

export function MeasurementForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const { t, district } = useI18n();
  const { addMeasurement, realMeasurements } = useData();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  // Suggest previously entered schools (real data) so names stay consistent.
  const knownSchools = useMemo(() => [...new Set(realMeasurements.map((m) => m.schoolName))], [realMeasurements]);

  const numbers = { students: toNumber(form.students), plants: toNumber(form.plants), co2: toNumber(form.co2), temperature: toNumber(form.temperature), humidity: toNumber(form.humidity) };
  const preview = checkQuality({ ...numbers, type: form.type }).filter((i) => {
    // don't nag about fields the user hasn't reached yet
    if (i === 'missingCo2') return false;
    if (i === 'missingStudents') return false;
    if ((i === 'missingTemperature' || i === 'missingHumidity') && form.co2 === '') return false;
    if (i === 'noPlantsInExperimental' && form.plants === '') return false;
    return true;
  });

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.schoolName.trim()) e.schoolName = t.form.required;
    if (!form.district) e.district = t.form.selectDistrict;
    if (!form.date) e.date = t.form.required;
    if (!form.time) e.time = t.form.required;
    if (!form.className.trim()) e.className = t.form.required;
    if (form.co2.trim() === '') e.co2 = t.form.required;
    (['students', 'plants', 'co2', 'temperature', 'humidity'] as const).forEach((k) => {
      const v = numbers[k];
      if (v !== null && !Number.isFinite(v)) e[k] = t.form.invalidNumber;
    });
    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    const payload: NewMeasurement = {
      date: form.date, time: form.time, schoolId: slugify(form.schoolName), schoolName: form.schoolName,
      district: form.district, className: form.className, type: form.type,
      ...numbers, ventilation: form.ventilation, notes: form.notes,
    };
    await addMeasurement(payload);
    setSaving(false);
    onSaved();
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <InputField id="f-school" label={t.form.school} value={form.schoolName} onChange={(e) => set('schoolName', e.target.value)} placeholder={t.form.schoolPlaceholder} error={errors.schoolName} list="known-schools" autoComplete="off" />
          <datalist id="known-schools">{knownSchools.map((s) => <option key={s} value={s} />)}</datalist>
        </div>
        <SelectField id="f-district" label={t.form.district} value={form.district} onChange={(e) => set('district', e.target.value)} error={errors.district}>
          <option value="">{t.form.selectDistrict}</option>
          {[...DISTRICT_IDS, 'nizami', 'sabunchu', 'surakhani', 'khazar', 'garadagh', 'pirallahi'].map((d) => <option key={d} value={d}>{district(d)}</option>)}
        </SelectField>
        <InputField id="f-date" type="date" label={t.form.date} value={form.date} onChange={(e) => set('date', e.target.value)} error={errors.date} />
        <InputField id="f-time" type="time" label={t.form.time} value={form.time} onChange={(e) => set('time', e.target.value)} error={errors.time} />
        <InputField id="f-class" label={t.form.className} value={form.className} onChange={(e) => set('className', e.target.value)} placeholder={t.form.classPlaceholder} error={errors.className} />
        <div>
          <Label>{t.form.type}</Label>
          <Segmented label={t.form.type} value={form.type} onChange={(v) => { set('type', v); if (v === 'control') set('plants', '0'); }}
            options={[{ value: 'experimental', label: `🌿 ${t.common.experimental}` }, { value: 'control', label: t.common.control }]} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-2xl bg-sunken/60 p-4 sm:grid-cols-3">
        <InputField id="f-co2" label={t.form.co2} inputMode="numeric" value={form.co2} onChange={(e) => set('co2', e.target.value)} error={errors.co2} className="font-mono" />
        <InputField id="f-students" label={t.form.students} inputMode="numeric" value={form.students} onChange={(e) => set('students', e.target.value)} error={errors.students} />
        <InputField id="f-plants" label={t.form.plants} inputMode="numeric" value={form.plants} onChange={(e) => set('plants', e.target.value)} error={errors.plants} />
        <InputField id="f-temp" label={t.form.temperature} inputMode="decimal" value={form.temperature} onChange={(e) => set('temperature', e.target.value)} error={errors.temperature} />
        <InputField id="f-hum" label={t.form.humidity} inputMode="decimal" value={form.humidity} onChange={(e) => set('humidity', e.target.value)} error={errors.humidity} />
        <div>
          <Label>{t.form.ventilation}</Label>
          <Segmented label={t.form.ventilation} value={form.ventilation} onChange={(v) => set('ventilation', v)}
            options={[{ value: 'yes', label: t.common.yes }, { value: 'no', label: t.common.no }, { value: 'unknown', label: '?' }]} />
        </div>
      </div>

      <div>
        <Label htmlFor="f-notes">{t.form.notes}</Label>
        <textarea id="f-notes" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder={t.form.notesPlaceholder} className="field resize-y" />
      </div>

      {preview.length > 0 && (
        <div className="rounded-2xl border border-signal/30 bg-signal-soft px-4 py-3 text-sm">
          <p className="font-medium">{t.form.qualityPreview}</p>
          <ul className="mt-1 list-inside list-disc text-muted">{preview.map((i) => <li key={i}>{t.quality.issues[i]}</li>)}</ul>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onCancel}>{t.common.cancel}</Button>
        <Button type="submit" disabled={saving}>{t.form.save}</Button>
      </div>
    </form>
  );
}
