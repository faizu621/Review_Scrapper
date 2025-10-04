
import React, {useState} from 'react';

export default function AddReview({onSearch}){
  const [form, setForm] = useState({
    company: '',
    startDate: '',
    endDate: '',
    source: 'Capterra'
  });

  const submit = async (e) => {
    e.preventDefault();
    if (form.company.trim()) {
      onSearch({
        company: form.company.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        source: form.source
      });
    }
  };

  return (
    <form onSubmit={submit} style={{marginBottom:28, display:'flex', flexWrap:'wrap', gap:16, alignItems:'center', justifyContent:'center'}}>
      <input
        required
        placeholder="Company Name"
        value={form.company}
        onChange={e=>setForm(f=>({...f, company:e.target.value}))}
        style={{padding:8, fontSize:16, minWidth:180, borderRadius:6, border:'1px solid #cbd5e1'}}
      />
      <input
        type="date"
        placeholder="Start Date"
        value={form.startDate}
        onChange={e=>setForm(f=>({...f, startDate:e.target.value}))}
        style={{padding:8, fontSize:16, minWidth:140, borderRadius:6, border:'1px solid #cbd5e1'}}
      />
      <input
        type="date"
        placeholder="End Date"
        value={form.endDate}
        onChange={e=>setForm(f=>({...f, endDate:e.target.value}))}
        style={{padding:8, fontSize:16, minWidth:140, borderRadius:6, border:'1px solid #cbd5e1'}}
      />
      <select
        value={form.source}
        onChange={e=>setForm(f=>({...f, source:e.target.value}))}
        style={{padding:8, fontSize:16, minWidth:120, borderRadius:6, border:'1px solid #cbd5e1'}}
        disabled
      >
        <option value="Capterra">Capterra</option>
        <option value="G2">G2</option>
      </select>
      <button type="submit" style={{padding:'10px 22px', fontSize:17, background:'#3182ce', color:'#fff', border:'none', borderRadius:6, fontWeight:600, cursor:'pointer'}}>Fetch Reviews</button>
    </form>
  );
}
