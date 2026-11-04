import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Props {
  data: {day: string;hours: number;live?: boolean;}[];
}

export function WeeklyTrendChart({ data }: Props) {
  return (
    <div className="h-36 w-full" role="img" aria-label={`Hours recorded per day: ${data.map((d) => `${d.day} ${d.hours.toFixed(1)} hours`).join(', ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, left: -24, bottom: 0 }}>
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} width={40} />
          <Tooltip
            cursor={{ fill: '#F1F5F9' }}
            contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }}
            formatter={(v: number, _n, item) => [`${v.toFixed(1)} h${item?.payload?.live ? ' (so far, raw)' : ''}`, 'Recorded']} />
          
          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {data.map((d) =>
            <Cell key={d.day} fill={d.live ? '#0D9488' : '#2563EB'} />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>);

}