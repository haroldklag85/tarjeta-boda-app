import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Users, CheckCircle, XCircle, Download, Search, RefreshCw, Key, Check, MessageSquare, Link, FileText, Send, AlertTriangle, Music, Heart } from 'lucide-react';

interface RSVPRecord {
  id: string;
  invitation_id: string;
  name: string;
  phone: string;
  is_attending: boolean;
  allergies: string;
  wish: string;
  extra_guests: string[];
  song_suggestion: string | null;
  created_at: string;
  invitations: {
    id: string;
    code: string;
    group_name: string;
    max_guests: number;
    custom_message?: string;
  } | null;
}

interface InvitationRecord {
  id: string;
  code: string;
  group_name: string;
  max_guests: number;
  custom_message: string;
  created_at: string;
  whatsapp_sent_at?: string | null;
}

export default function AdminPanel() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'rsvps' | 'links' | 'special'>('rsvps');
  const [loading, setLoading] = useState(true);
  const [rsvps, setRsvps] = useState<RSVPRecord[]>([]);
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  // Search terms
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [linkSearch, setLinkSearch] = useState('');
  const [specialSearch, setSpecialSearch] = useState('');
  
  const [stats, setStats] = useState({
    totalInvitations: 0,
    totalAttending: 0,
    totalNotAttending: 0,
    totalExtraGuests: 0,
    totalAllergies: 0,
    totalSongs: 0,
    totalWishes: 0,
  });

  const secretKey = import.meta.env.VITE_ADMIN_SECRET_KEY || '$oYanayharold2026';

  // Authorization check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('key');
    const isSessionAuthorized = sessionStorage.getItem('admin_authorized') === 'true';

    if (key === secretKey || isSessionAuthorized) {
      setAuthorized(true);
      if (key === secretKey) {
        sessionStorage.setItem('admin_authorized', 'true');
      }
      fetchData();
    } else {
      setAuthorized(false);
      setLoading(false);
    }
  }, [secretKey]);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === secretKey) {
      setAuthorized(true);
      setPasswordError(false);
      sessionStorage.setItem('admin_authorized', 'true');
      fetchData();
    } else {
      setPasswordError(true);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch RSVPs
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvp')
        .select(`
          id,
          invitation_id,
          name,
          phone,
          is_attending,
          allergies,
          wish,
          extra_guests,
          song_suggestion,
          created_at,
          invitations (
            id,
            code,
            group_name,
            max_guests,
            custom_message
          )
        `)
        .order('created_at', { ascending: false });

      if (rsvpError) throw rsvpError;
      const rsvpRecords = (rsvpData || []) as unknown as RSVPRecord[];
      setRsvps(rsvpRecords);

      // Calculate stats
      let attendingCount = 0;
      let notAttendingCount = 0;
      let extraCount = 0;
      let allergiesCount = 0;
      let songsCount = 0;
      let wishesCount = 0;

      rsvpRecords.forEach(r => {
        if (r.is_attending) {
          attendingCount++;
          if (r.extra_guests && Array.isArray(r.extra_guests)) {
            extraCount += r.extra_guests.filter(name => name.trim().length > 0).length;
          }
        } else {
          notAttendingCount++;
        }

        if (r.allergies && r.allergies.trim().length > 0 && r.allergies.toLowerCase() !== 'ninguna' && r.allergies.toLowerCase() !== 'ninguno') {
          allergiesCount++;
        }
        if (r.song_suggestion && r.song_suggestion.trim().length > 0) {
          songsCount++;
        }
        if (r.wish && r.wish.trim().length > 0) {
          wishesCount++;
        }
      });

      setStats({
        totalInvitations: rsvpRecords.length,
        totalAttending: attendingCount,
        totalNotAttending: notAttendingCount,
        totalExtraGuests: extraCount,
        totalAllergies: allergiesCount,
        totalSongs: songsCount,
        totalWishes: wishesCount,
      });

      // 2. Fetch all Invitations (with fallback if whatsapp_sent_at is not created yet)
      let invData;
      const { data: testData, error: testError } = await supabase
        .from('invitations')
        .select('id, code, group_name, max_guests, custom_message, created_at, whatsapp_sent_at')
        .order('group_name', { ascending: true });

      if (testError) {
        console.warn('Could not fetch whatsapp_sent_at column. Falling back to query without it. Make sure to run SQL command.', testError);
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('invitations')
          .select('id, code, group_name, max_guests, custom_message, created_at')
          .order('group_name', { ascending: true });

        if (fallbackError) throw fallbackError;
        invData = fallbackData;
      } else {
        invData = testData;
      }
      setInvitations((invData || []) as InvitationRecord[]);

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string, id: string) => {
    const link = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyMessageToClipboard = (code: string, id: string) => {
    const link = `${window.location.origin}/${code}`;
    const text = `Hola, queremos compartir contigo nuestra invitación de boda. Será un día muy especial para nosotros y nos encantaría vivirlo con tu compañía. Puedes ingresar y confirmar tu asistencia aquí: ${link}`;
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const getWhatsAppLink = (code: string) => {
    const link = `${window.location.origin}/${code}`;
    const text = `Hola, queremos compartir contigo nuestra invitación de boda. Será un día muy especial para nosotros y nos encantaría vivirlo con tu compañía. Puedes ingresar y confirmar tu asistencia aquí: ${link}`;
    const cleanPhone = code.replace(/\D/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.length === 10) {
      formattedPhone = `57${cleanPhone}`;
    }
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
  };

  const handleWhatsAppSend = async (invitationId: string, code: string) => {
    const url = getWhatsAppLink(code);
    window.open(url, '_blank', 'noopener,noreferrer');

    const sentAt = new Date().toISOString();
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ whatsapp_sent_at: sentAt })
        .eq('id', invitationId);

      if (error) {
        console.error('Failed to save whatsapp_sent_at in Supabase (make sure the SQL command was run):', error);
      } else {
        setInvitations(prev =>
          prev.map(inv =>
            inv.id === invitationId ? { ...inv, whatsapp_sent_at: sentAt } : inv
          )
        );
      }
    } catch (err) {
      console.error('Error updating whatsapp_sent_at:', err);
    }
  };

  const downloadCSVTemplate = () => {
    const headers = ['code', 'group_name', 'max_guests', 'custom_message'];
    const sampleRows = [
      ['3001234567', 'Familia Pérez y Acompañante', '2', 'Queridos tíos, nos haría muy felices contar con su presencia en este día tan especial.'],
      ['3107654321', 'Juan Gómez', '1', 'Juan, esperamos de todo corazón que puedas acompañarnos a celebrar nuestro gran día.']
    ];
    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...sampleRows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(';'))
    ].join('\n');
    triggerDownload(csvContent, 'plantilla_invitaciones_bulk.csv');
  };

  const exportRsvps = () => {
    if (rsvps.length === 0) return;

    const headers = [
      'Grupo/Invitación',
      'Celular de Enlace',
      'Nombre Principal',
      'Teléfono Confirmación',
      'Asiste',
      'Alergias/Restricciones',
      'Canción Sugerida',
      'Acompañantes',
      'Mensaje/Deseo',
      'Fecha Confirmación'
    ];

    const rows = rsvps.map(r => [
      r.invitations?.group_name || 'N/A',
      r.invitations?.code || 'N/A',
      r.name,
      r.phone,
      r.is_attending ? 'SÍ' : 'NO',
      r.allergies || 'Ninguna',
      r.song_suggestion || 'Ninguna',
      Array.isArray(r.extra_guests) ? r.extra_guests.filter(n => n.trim().length > 0).join(', ') : '',
      r.wish || '',
      new Date(r.created_at).toLocaleString('es-ES')
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    triggerDownload(csvContent, `confirmaciones_boda_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportLinks = () => {
    if (invitations.length === 0) return;

    const headers = [
      'Nombre Invitado (Sobre)',
      'Celular / Código',
      'Acompañantes Permitidos',
      'Mensaje Personalizado',
      'Enlace Único de Invitación'
    ];

    const rows = invitations.map(i => [
      i.group_name,
      i.code,
      i.max_guests,
      i.custom_message || 'Ninguno',
      `${window.location.origin}/${i.code}`
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    triggerDownload(csvContent, `enlaces_whatsapp_boda_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportSpecialDetails = () => {
    if (rsvps.length === 0) return;

    const headers = [
      'Nombre Invitado',
      'Invitación / Grupo',
      '¿Asiste?',
      'Alergias / Restricciones',
      'Canción Sugerida',
      'Deseo / Mensaje'
    ];

    const rows = rsvps.map(r => [
      r.name,
      r.invitations?.group_name || 'N/A',
      r.is_attending ? 'SÍ' : 'NO',
      r.allergies || 'Ninguna',
      r.song_suggestion || 'Ninguna',
      r.wish || ''
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    triggerDownload(csvContent, `detalles_especiales_boda_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const triggerDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRsvps = rsvps.filter(r => {
    const term = rsvpSearch.toLowerCase();
    return (
      r.name.toLowerCase().includes(term) ||
      (r.invitations?.group_name && r.invitations.group_name.toLowerCase().includes(term)) ||
      r.phone.includes(term)
    );
  });

  const filteredInvitations = invitations.filter(i => {
    const term = linkSearch.toLowerCase();
    return (
      i.group_name.toLowerCase().includes(term) ||
      i.code.includes(term) ||
      (i.custom_message && i.custom_message.toLowerCase().includes(term))
    );
  });

  const filteredSpecial = rsvps.filter(r => {
    const term = specialSearch.toLowerCase();
    return (
      r.name.toLowerCase().includes(term) ||
      (r.invitations?.group_name && r.invitations.group_name.toLowerCase().includes(term)) ||
      (r.allergies && r.allergies.toLowerCase().includes(term)) ||
      (r.song_suggestion && r.song_suggestion.toLowerCase().includes(term)) ||
      (r.wish && r.wish.toLowerCase().includes(term))
    );
  });

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-[#F2EFE9] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-xl border border-[#D1C4B0]/40 shadow-sm max-w-sm w-full flex flex-col items-center">
          <div className="w-16 h-16 bg-[#edf7df] rounded-full flex items-center justify-center text-primary mb-6">
            <Key size={32} />
          </div>
          <h1 className="font-serif text-2xl text-[#2C3525] mb-2 font-bold">Acceso Panel Admin</h1>
          <p className="text-[#44483f] text-sm mb-6">
            Por favor ingresa la clave de administrador para acceder a las confirmaciones y enlaces de invitaciones.
          </p>
          <form onSubmit={handleManualLogin} className="w-full flex flex-col gap-4">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-[#FBFBFA] border border-[#D1C4B0] rounded focus:ring-0 focus:border-primary placeholder-[#c4c8bc] transition-colors"
              required
            />
            {passwordError && (
              <p className="text-xs font-semibold text-[#b35c44]">Contraseña incorrecta. Inténtalo de nuevo.</p>
            )}
            <button
              type="submit"
              className="w-full bg-primary text-white py-2.5 rounded font-semibold text-sm hover:bg-[#384c2b] transition-colors shadow-sm"
            >
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2EFE9] p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl text-primary font-bold">Panel Administrativo</h1>
            <p className="text-sm text-[#44483f] mt-1">Gobernanza de invitaciones, enlaces de WhatsApp y confirmados</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white border border-[#D1C4B0] text-primary px-4 py-2.5 rounded hover:bg-[#e7f2da]/30 transition-colors text-sm font-semibold shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            {activeTab !== 'special' && (
              <button
                onClick={activeTab === 'rsvps' ? exportRsvps : exportLinks}
                disabled={loading || (activeTab === 'rsvps' ? rsvps.length === 0 : invitations.length === 0)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded hover:bg-[#384c2b] transition-colors text-sm font-semibold shadow-sm disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {activeTab === 'rsvps' ? 'Descargar Excel RSVP' : 'Descargar Excel Enlaces'}
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#D1C4B0]/30 mb-8 gap-6 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('rsvps')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'rsvps' ? 'border-primary text-primary' : 'border-transparent text-[#8a8d86] hover:text-[#2C3525]'}`}
          >
            Confirmados (RSVP)
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'links' ? 'border-primary text-primary' : 'border-transparent text-[#8a8d86] hover:text-[#2C3525]'}`}
          >
            Enlaces de WhatsApp (Invitaciones)
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'special' ? 'border-primary text-primary' : 'border-transparent text-[#8a8d86] hover:text-[#2C3525]'}`}
          >
            Detalles de Invitados (Especiales)
          </button>
        </div>

        {/* Dynamic Panel Contents */}
        {activeTab === 'rsvps' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-xl border border-[#D1C4B0]/40 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Grupos Confirmados</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-[#2C3525]">{stats.totalInvitations}</span>
                  <Users className="h-4 w-4 text-[#C49550] opacity-80" />
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-[#D1C4B0]/40 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Asisten (Principal)</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-primary">{stats.totalAttending}</span>
                  <CheckCircle className="h-4 w-4 text-primary opacity-80" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#D1C4B0]/40 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Acompañantes</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-primary">{stats.totalExtraGuests}</span>
                  <CheckCircle className="h-4 w-4 text-primary opacity-85" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#D1C4B0]/40 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">No Asisten</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-[#b35c44]">{stats.totalNotAttending}</span>
                  <XCircle className="h-4 w-4 text-[#b35c44] opacity-80" />
                </div>
              </div>
            </div>

            {/* Total General Pill */}
            <div className="bg-[#e7f2da] border border-primary/20 text-[#2C3525] px-6 py-4 rounded-xl mb-8 flex justify-between items-center shadow-sm">
              <span className="font-serif italic text-lg text-primary font-semibold">Total Asistentes Confirmados:</span>
              <span className="text-3xl font-extrabold text-[#2C3525]">{stats.totalAttending + stats.totalExtraGuests} <span className="text-lg font-normal text-[#566247]">personas</span></span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#D1C4B0]/40 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#D1C4B0]/30 bg-[#FBFBFA] flex items-center">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8d86] h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o teléfono..."
                    value={rsvpSearch}
                    onChange={e => setRsvpSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#D1C4B0] rounded focus:ring-0 focus:border-primary placeholder-[#c4c8bc] transition-colors"
                  />
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center text-[#8a8d86]">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                  Cargando confirmaciones...
                </div>
              ) : filteredRsvps.length === 0 ? (
                <div className="py-20 text-center text-[#8a8d86]">
                  No se encontraron registros de confirmación.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#FBFBFA] border-b border-[#D1C4B0]/30 text-xs font-semibold text-[#566247] uppercase tracking-wider">
                        <th className="p-4">Invitación</th>
                        <th className="p-4">Nombre Principal</th>
                        <th className="p-4">¿Asiste?</th>
                        <th className="p-4">Alergias</th>
                        <th className="p-4">Música</th>
                        <th className="p-4">Acompañantes</th>
                        <th className="p-4">Mensaje / Deseo</th>
                        <th className="p-4 text-right">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D1C4B0]/20 text-[#44483f]">
                      {filteredRsvps.map((r) => {
                        const extraNames = Array.isArray(r.extra_guests) 
                          ? r.extra_guests.filter(n => n.trim().length > 0)
                          : [];

                        return (
                          <tr key={r.id} className="hover:bg-[#FDFDFD] transition-colors">
                            <td className="p-4 font-medium text-[#2C3525]">
                              <div>{r.invitations?.group_name || 'N/A'}</div>
                              <div className="text-[10px] text-[#8a8d86] uppercase tracking-wider font-sans font-semibold mt-0.5">
                                Cód: {r.invitations?.code || 'N/A'}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-[#2C3525]">{r.name}</div>
                              <div className="text-xs text-[#8a8d86] font-mono">{r.phone}</div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${r.is_attending ? 'bg-[#e7f2da] text-primary' : 'bg-[#b35c44]/10 text-[#b35c44]'}`}>
                                {r.is_attending ? 'SÍ' : 'NO'}
                              </span>
                            </td>
                            <td className="p-4 max-w-[150px] truncate" title={r.allergies}>
                              {r.allergies || <span className="text-[#c4c8bc] italic">Ninguna</span>}
                            </td>
                            <td className="p-4 max-w-[150px] truncate" title={r.song_suggestion || ''}>
                              {r.song_suggestion || <span className="text-[#c4c8bc] italic">-</span>}
                            </td>
                            <td className="p-4">
                              {extraNames.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {extraNames.map((name, idx) => (
                                    <span key={idx} className="bg-[#edf7df] text-primary/80 px-2 py-0.5 rounded text-xs w-fit border border-primary/5">
                                      • {name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[#c4c8bc] italic">Sin acompañantes</span>
                              )}
                            </td>
                            <td className="p-4 max-w-[200px] whitespace-pre-wrap text-xs italic" title={r.wish}>
                              {r.wish ? `"${r.wish}"` : <span className="text-[#c4c8bc]">-</span>}
                            </td>
                            <td className="p-4 text-right text-xs text-[#8a8d86] font-mono">
                              {new Date(r.created_at).toLocaleDateString('es-ES')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'links' && (
          <div className="flex flex-col gap-6">
            {/* Stats Cards for Enlaces tab */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-[#D1C4B0]/40 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Total Sobres / Invitaciones</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-[#2C3525]">{invitations.length}</span>
                  <Link className="h-4 w-4 text-[#C49550] opacity-80" />
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-[#D1C4B0]/40 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Total Personas Invitadas</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-primary">
                    {invitations.reduce((sum, i) => sum + (i.max_guests || 0), 0)}
                  </span>
                  <Users className="h-4 w-4 text-primary opacity-80" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#D1C4B0]/40 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Invitaciones Sin Respuesta</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-amber-600">
                    {(() => {
                      const respondedIds = new Set(rsvps.map(r => r.invitation_id).filter(Boolean));
                      return invitations.filter(inv => !respondedIds.has(inv.id)).length;
                    })()}
                  </span>
                  <AlertTriangle className="h-4 w-4 text-amber-600 opacity-80" />
                </div>
              </div>
            </div>

            {/* Quick Guide and CSV Template Download */}
            <div className="bg-white rounded-xl border border-[#D1C4B0]/40 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <h3 className="font-serif text-lg text-primary font-bold mb-2">Importación Masiva de Invitaciones</h3>
                <p className="text-xs text-[#44483f] leading-relaxed max-w-3xl">
                  Para cargar tus invitados en bloque desde Excel, guarda tu archivo como <strong>CSV (delimitado por comas)</strong> con las siguientes columnas exactas:
                  <code className="bg-[#FBFBFA] border border-[#D1C4B0]/40 px-1 py-0.5 rounded font-mono text-primary text-[11px] ml-1">code</code> (número de celular / código),
                  <code className="bg-[#FBFBFA] border border-[#D1C4B0]/40 px-1 py-0.5 rounded font-mono text-primary text-[11px] ml-1">group_name</code> (sobre del invitado),
                  <code className="bg-[#FBFBFA] border border-[#D1C4B0]/40 px-1 py-0.5 rounded font-mono text-primary text-[11px] ml-1">max_guests</code> (límite de personas), y
                  <code className="bg-[#FBFBFA] border border-[#D1C4B0]/40 px-1 py-0.5 rounded font-mono text-primary text-[11px] ml-1">custom_message</code> (mensaje personalizado opcional).
                  Luego, impórtalo desde la consola de Supabase en la tabla <strong>invitations</strong>.
                </p>
              </div>
              <button
                onClick={downloadCSVTemplate}
                className="flex items-center gap-2 bg-[#e7f2da] hover:bg-[#d7e5c2] text-primary px-4 py-2.5 rounded font-semibold text-xs transition-colors shadow-sm self-start md:self-auto whitespace-nowrap"
              >
                <Download className="h-4 w-4" />
                Descargar Plantilla CSV
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[#D1C4B0]/40 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#D1C4B0]/30 bg-[#FBFBFA] flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8d86] h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar invitaciones por nombre o celular..."
                    value={linkSearch}
                    onChange={e => setLinkSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#D1C4B0] rounded focus:ring-0 focus:border-primary placeholder-[#c4c8bc] transition-colors"
                  />
                </div>
                <div className="text-xs font-semibold text-[#566247] flex items-center bg-[#e7f2da] px-3 py-2 rounded border border-primary/5">
                  Total Registradas: {invitations.length} invitaciones
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center text-[#8a8d86]">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                  Cargando invitaciones...
                </div>
              ) : filteredInvitations.length === 0 ? (
                <div className="py-20 text-center text-[#8a8d86]">
                  No se encontraron invitaciones cargadas. Utiliza la consola de Supabase para importar masivamente tu CSV.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#FBFBFA] border-b border-[#D1C4B0]/30 text-xs font-semibold text-[#566247] uppercase tracking-wider">
                        <th className="p-4">Invitado (Sobre)</th>
                        <th className="p-4">Código / Celular</th>
                        <th className="p-4">Mensaje Personalizado</th>
                        <th className="p-4">Acompañantes Permitidos</th>
                        <th className="p-4">Enlace de Invitación</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D1C4B0]/20 text-[#44483f]">
                      {filteredInvitations.map((i) => {
                        const guestLink = `${window.location.origin}/${i.code}`;

                        return (
                          <tr key={i.id} className="hover:bg-[#FDFDFD] transition-colors">
                            <td className="p-4 font-semibold text-[#2C3525]">
                              {i.group_name}
                            </td>
                            <td className="p-4 font-mono font-bold text-[#2C3525]">
                              {i.code}
                            </td>
                            <td className="p-4 max-w-[200px] truncate italic text-xs text-[#8a8d86]" title={i.custom_message}>
                              {i.custom_message ? (
                                <span className="flex items-center gap-1">
                                  <MessageSquare size={12} className="flex-shrink-0 text-primary/70" />
                                  {i.custom_message}
                                </span>
                              ) : (
                                <span className="text-[#c4c8bc]">-</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <span className="bg-[#FBFBFA] border border-[#D1C4B0]/50 text-[#566247] font-semibold px-2 py-0.5 rounded text-xs">
                                {i.max_guests} {i.max_guests === 1 ? 'persona' : 'personas'}
                              </span>
                            </td>
                            <td className="p-4">
                              <input
                                type="text"
                                readOnly
                                value={guestLink}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                                className="bg-[#FBFBFA] border border-[#D1C4B0]/40 rounded px-2 py-1 text-xs font-mono text-[#8a8d86] w-full max-w-[280px] focus:outline-none"
                              />
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <div className="flex items-center justify-center gap-2">
                                  {/* 1. Copy bare Link */}
                                  <button
                                    onClick={() => copyToClipboard(i.code, i.id)}
                                    className={`p-2 rounded border transition-colors shadow-sm ${copiedId === i.id ? 'bg-[#e7f2da] border-primary text-primary' : 'bg-white border-[#D1C4B0] hover:bg-[#e7f2da]/30 text-[#44483f]'}`}
                                    title="Copiar enlace"
                                  >
                                    {copiedId === i.id ? <Check size={14} /> : <Link size={14} />}
                                  </button>

                                  {/* 2. Copy Message */}
                                  <button
                                    onClick={() => copyMessageToClipboard(i.code, i.id)}
                                    className={`p-2 rounded border transition-colors shadow-sm ${copiedMsgId === i.id ? 'bg-[#e7f2da] border-primary text-primary' : 'bg-white border-[#D1C4B0] hover:bg-[#e7f2da]/30 text-[#44483f]'}`}
                                    title="Copiar mensaje completo"
                                  >
                                    {copiedMsgId === i.id ? <Check size={14} /> : <FileText size={14} />}
                                  </button>

                                  {/* 3. Send by WhatsApp with traceability & alert */}
                                  {(() => {
                                    const respondedIds = new Set(rsvps.map(r => r.invitation_id).filter(Boolean));
                                    const hasRSVP = respondedIds.has(i.id);
                                    let isOverdue = false;
                                    if (i.whatsapp_sent_at && !hasRSVP) {
                                      const sentDate = new Date(i.whatsapp_sent_at);
                                      const today = new Date();
                                      const diffTime = today.getTime() - sentDate.getTime();
                                      const diffDays = diffTime / (1000 * 60 * 60 * 24);
                                      isOverdue = diffDays >= 10;
                                    }

                                    if (isOverdue) {
                                      return (
                                        <button
                                          onClick={() => handleWhatsAppSend(i.id, i.code)}
                                          className="p-2 rounded border border-amber-500 bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm animate-pulse"
                                          title="Reenviar invitación (Alerta: enviado hace más de 10 días sin respuesta)"
                                        >
                                          <AlertTriangle size={14} />
                                        </button>
                                      );
                                    }

                                    return (
                                      <button
                                        onClick={() => handleWhatsAppSend(i.id, i.code)}
                                        className="p-2 rounded border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] transition-colors shadow-sm"
                                        title="Enviar por WhatsApp"
                                      >
                                        <Send size={14} />
                                      </button>
                                    );
                                  })()}
                                </div>
                                {i.whatsapp_sent_at ? (
                                  <span className="block text-[10px] text-stone-500 mt-1.5 font-medium whitespace-nowrap">
                                    Enviado: {new Date(i.whatsapp_sent_at).toLocaleDateString('es-ES')}
                                  </span>
                                ) : (
                                  <span className="block text-[10px] text-stone-400 mt-1.5 font-medium whitespace-nowrap italic">
                                    Sin enviar
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'special' && (
          <div className="flex flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <div className="bg-white p-5 rounded-xl border border-[#D1C4B0]/40 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Alergias Reportadas</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-[#b35c44]">{stats.totalAllergies}</span>
                  <AlertTriangle className="h-5 w-5 text-[#b35c44] opacity-80" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#D1C4B0]/40 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Canciones Sugeridas</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-primary">{stats.totalSongs}</span>
                  <Music className="h-5 w-5 text-primary opacity-80" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#D1C4B0]/40 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Deseos Recibidos</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-[#C49550]">{stats.totalWishes}</span>
                  <Heart className="h-5 w-5 text-[#C49550] opacity-80" />
                </div>
              </div>
            </div>

            {/* Card wrapper */}
            <div className="bg-white rounded-xl border border-[#D1C4B0]/40 shadow-sm overflow-hidden">
              {/* Header with Search and Export button */}
              <div className="p-4 border-b border-[#D1C4B0]/30 bg-[#FBFBFA] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8d86] h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, alergia, canción o deseo..."
                    value={specialSearch}
                    onChange={e => setSpecialSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#D1C4B0] rounded focus:ring-0 focus:border-primary placeholder-[#c4c8bc] transition-colors"
                  />
                </div>
                <button
                  onClick={exportSpecialDetails}
                  disabled={loading || rsvps.length === 0}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded hover:bg-[#384c2b] transition-colors text-sm font-semibold shadow-sm disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Descargar Especiales CSV
                </button>
              </div>

              {loading ? (
                <div className="py-20 text-center text-[#8a8d86]">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                  Cargando detalles especiales...
                </div>
              ) : filteredSpecial.length === 0 ? (
                <div className="py-20 text-center text-[#8a8d86]">
                  No se encontraron detalles especiales.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#FBFBFA] border-b border-[#D1C4B0]/30 text-xs font-semibold text-[#566247] uppercase tracking-wider">
                        <th className="p-4">Grupo / Código</th>
                        <th className="p-4">Nombre Confirmado / Celular</th>
                        <th className="p-4">¿Asiste?</th>
                        <th className="p-4">Alergias / Restricciones</th>
                        <th className="p-4">Canción Sugerida</th>
                        <th className="p-4">Mensaje / Deseo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D1C4B0]/20 text-[#44483f]">
                      {filteredSpecial.map((r) => {
                        const hasAllergy = r.allergies && r.allergies.trim().length > 0 && r.allergies.toLowerCase() !== 'ninguna' && r.allergies.toLowerCase() !== 'ninguno';

                        return (
                          <tr key={r.id} className="hover:bg-[#FDFDFD] transition-colors">
                            <td className="p-4 font-medium text-[#2C3525]">
                              <div>{r.invitations?.group_name || 'N/A'}</div>
                              <div className="text-[10px] text-[#8a8d86] uppercase tracking-wider font-sans font-semibold mt-0.5">
                                Cód: {r.invitations?.code || 'N/A'}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-[#2C3525]">{r.name}</div>
                              <div className="text-xs text-[#8a8d86] font-mono">{r.phone}</div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${r.is_attending ? 'bg-[#e7f2da] text-primary' : 'bg-[#b35c44]/10 text-[#b35c44]'}`}>
                                {r.is_attending ? 'SÍ' : 'NO'}
                              </span>
                            </td>
                            <td className={`p-4 max-w-[180px] truncate ${hasAllergy ? 'text-[#b35c44] font-semibold' : ''}`} title={r.allergies}>
                              {r.allergies && r.allergies.trim().length > 0 ? r.allergies : <span className="text-[#c4c8bc] italic">Ninguna</span>}
                            </td>
                            <td className="p-4 max-w-[180px] truncate" title={r.song_suggestion || ''}>
                              {r.song_suggestion && r.song_suggestion.trim().length > 0 ? (
                                <span className="flex items-center gap-1">
                                  <Music size={12} className="text-primary/70 flex-shrink-0" />
                                  {r.song_suggestion}
                                </span>
                              ) : (
                                <span className="text-[#c4c8bc] italic">-</span>
                              )}
                            </td>
                            <td className="p-4 max-w-[250px] truncate italic text-xs" title={r.wish}>
                              {r.wish && r.wish.trim().length > 0 ? `"${r.wish}"` : <span className="text-[#c4c8bc] italic">-</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
