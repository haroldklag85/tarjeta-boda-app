import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Users, CheckCircle, XCircle, Download, Upload, Search, RefreshCw, Key, Check, MessageSquare, Link, FileText, Send, AlertTriangle, Music, Heart, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [activeTab, setActiveTab] = useState<'rsvps' | 'links' | 'special' | 'photos'>('rsvps');
  const [loading, setLoading] = useState(true);
  const [rsvps, setRsvps] = useState<RSVPRecord[]>([]);
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [photoUploads, setPhotoUploads] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // WhatsApp template state
  const [whatsappTemplate, setWhatsappTemplate] = useState('Hola, queremos compartir contigo nuestra invitación de boda. Será un día muy especial para nosotros y nos encantaría vivirlo con tu compañía. Puedes ingresar y confirmar tu asistencia aquí:');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [tempTemplateText, setTempTemplateText] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [isLocalSettingsMode, setIsLocalSettingsMode] = useState(false);
  
  // Search terms
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [linkSearch, setLinkSearch] = useState('');
  const [specialSearch, setSpecialSearch] = useState('');
  const [photoSearch, setPhotoSearch] = useState('');
  
  // Import guest list states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTab, setImportTab] = useState<'paste' | 'file'>('paste');
  const [pasteText, setPasteText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStep, setImportStep] = useState<'input' | 'preview' | 'uploading' | 'success'>('input');
  const [validationReport, setValidationReport] = useState<any[]>([]);
  const [headerMapping, setHeaderMapping] = useState<{ [key: string]: string }>({});
  const [isOverwriteConfirmed, setIsOverwriteConfirmed] = useState(false);
  const [overwriteText, setOverwriteText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importSearch, setImportSearch] = useState('');
  const [importStats, setImportStats] = useState({ total: 0, valid: 0, warnings: 0, errors: 0 });
  
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

      // 3. Fetch Photo Uploads (with fallback if photo_uploads table is not created yet)
      try {
        const { data: photoData, error: photoError } = await supabase
          .from('photo_uploads')
          .select('*')
          .order('created_at', { ascending: false });

        if (photoError) throw photoError;
        setPhotoUploads(photoData || []);
      } catch (photoErr) {
        console.warn('Could not fetch photo_uploads. Make sure to run SQL command to create the table.', photoErr);
        setPhotoUploads([]);
      }

      // 4. Fetch WhatsApp message template from settings table
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'whatsapp_message_template')
          .maybeSingle();

        if (settingsError) throw settingsError;
        if (settingsData && settingsData.value) {
          setWhatsappTemplate(settingsData.value);
        }
        setIsLocalSettingsMode(false);
      } catch (settingsErr) {
        console.warn('Could not fetch whatsapp_message_template from settings. Falling back to local default.', settingsErr);
        setIsLocalSettingsMode(true);
      }

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveWhatsappTemplate = async () => {
    setSavingTemplate(true);
    try {
      const cleanTemplate = tempTemplateText.trim();
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'whatsapp_message_template', value: cleanTemplate });

      if (error) throw error;
      setWhatsappTemplate(cleanTemplate);
      setIsTemplateModalOpen(false);
      setIsLocalSettingsMode(false);
    } catch (err) {
      console.error('Error saving whatsapp template to Supabase settings:', err);
      // Fallback local update
      const cleanTemplate = tempTemplateText.trim();
      setWhatsappTemplate(cleanTemplate);
      setIsTemplateModalOpen(false);
      setIsLocalSettingsMode(true);
    } finally {
      setSavingTemplate(false);
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
    const baseText = whatsappTemplate.trim();
    const text = `${baseText} ${link}`;
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const getWhatsAppLink = (code: string) => {
    const link = `${window.location.origin}/${code}`;
    const baseText = whatsappTemplate.trim();
    const text = `${baseText} ${link}`;
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

  // Delimiter detection (supports tab, semicolon, comma)
  const detectDelimiter = (text: string): string => {
    const firstLine = text.split(/\r?\n/)[0] || '';
    const tabs = (firstLine.match(/\t/g) || []).length;
    const semicolons = (firstLine.match(/;/g) || []).length;
    const commas = (firstLine.match(/,/g) || []).length;
    
    if (tabs > semicolons && tabs > commas) return '\t';
    if (semicolons > commas) return ';';
    return ',';
  };

  // State-machine CSV/TSV parser supporting quotes and CRLF inside cells
  const parseCSVText = (text: string, delimiter: string): string[][] => {
    const result: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            cell += '"';
            i++; // skip next quote
          } else {
            inQuotes = false; // closing quote
          }
        } else {
          cell += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === delimiter) {
          row.push(cell);
          cell = '';
        } else if (char === '\n' || char === '\r') {
          row.push(cell);
          result.push(row);
          row = [];
          cell = '';
          if (char === '\r' && nextChar === '\n') {
            i++; // skip \n of \r\n
          }
        } else {
          cell += char;
        }
      }
    }
    if (cell || row.length > 0) {
      row.push(cell);
      result.push(row);
    }
    // Filter out empty rows
    return result.filter(r => r.length > 0 && r.some(c => c.trim().length > 0));
  };

  // Process and validate imports
  const processAndValidateData = (rawText: string) => {
    try {
      setImportError(null);
      const delimiter = detectDelimiter(rawText);
      const parsed = parseCSVText(rawText, delimiter);
      
      if (parsed.length < 2) {
        throw new Error('El archivo o texto no contiene suficientes filas (se requiere encabezado y al menos una fila de datos).');
      }

      const headers = parsed[0].map(h => h.trim().toLowerCase());
      
      // Mappings indices
      let codeIdx = -1;
      let groupNameIdx = -1;
      let maxGuestsIdx = -1;
      let customMessageIdx = -1;

      headers.forEach((h, idx) => {
        if (['code', 'codigo', 'celular', 'tel', 'telefono', 'phone'].includes(h)) {
          codeIdx = idx;
        } else if (['group_name', 'groupname', 'grupo', 'nombre', 'nombre_grupo', 'invitado', 'sobres', 'sobre'].includes(h)) {
          groupNameIdx = idx;
        } else if (['max_guests', 'maxguests', 'pases', 'invitados', 'maximo', 'personas', 'limite', 'cupos'].includes(h)) {
          maxGuestsIdx = idx;
        } else if (['custom_message', 'custommessage', 'mensaje', 'mensaje_personalizado', 'custom', 'carta'].includes(h)) {
          customMessageIdx = idx;
        }
      });

      // Position fallbacks if headers aren't exact
      if (codeIdx === -1) codeIdx = 0;
      if (groupNameIdx === -1 && parsed[0].length > 1) groupNameIdx = 1;
      if (maxGuestsIdx === -1 && parsed[0].length > 2) maxGuestsIdx = 2;
      if (customMessageIdx === -1 && parsed[0].length > 3) customMessageIdx = 3;

      const detectedMapping = {
        code: parsed[0][codeIdx] || 'Código/Celular (Columna 1)',
        group_name: parsed[0][groupNameIdx] || 'Grupo/Sobre (Columna 2)',
        max_guests: parsed[0][maxGuestsIdx] || 'Pases (Columna 3)',
        custom_message: customMessageIdx !== -1 && parsed[0][customMessageIdx] ? parsed[0][customMessageIdx] : 'Sin mapear',
      };
      setHeaderMapping(detectedMapping);

      const report: any[] = [];
      const codeSet = new Set<string>();
      let warningsCount = 0;
      let errorsCount = 0;

      for (let i = 1; i < parsed.length; i++) {
        const row = parsed[i];
        
        const rawCode = row[codeIdx] !== undefined ? row[codeIdx].trim() : '';
        const rawGroupName = row[groupNameIdx] !== undefined ? row[groupNameIdx].trim() : '';
        const rawMaxGuests = row[maxGuestsIdx] !== undefined ? row[maxGuestsIdx].trim() : '';
        const rawCustomMsg = customMessageIdx !== -1 && row[customMessageIdx] !== undefined ? row[customMessageIdx].trim() : '';

        const validatedRow: any = {
          rowIndex: i,
          code: rawCode,
          group_name: rawGroupName,
          max_guests: rawMaxGuests,
          custom_message: rawCustomMsg,
          status: 'success',
          issues: []
        };

        // 1. Group name validation
        if (!rawGroupName) {
          validatedRow.status = 'error';
          validatedRow.issues.push('Falta el nombre del grupo/sobre.');
        }

        // 2. Code validation
        if (!rawCode) {
          validatedRow.status = 'error';
          validatedRow.issues.push('Falta el celular/código.');
        } else {
          const cleanCode = rawCode.replace(/\D/g, '');
          if (cleanCode.length === 0) {
            validatedRow.status = 'error';
            validatedRow.issues.push('El código/celular debe contener dígitos.');
          } else if (cleanCode.length !== 10) {
            validatedRow.status = validatedRow.status === 'error' ? 'error' : 'warning';
            validatedRow.issues.push('El número de celular no tiene 10 dígitos (formato estándar de Colombia).');
          }
          
          if (codeSet.has(rawCode)) {
            validatedRow.status = 'error';
            validatedRow.issues.push(`Número de celular duplicado en el archivo: "${rawCode}".`);
          } else {
            codeSet.add(rawCode);
          }
        }

        // 3. Max guests validation
        if (!rawMaxGuests) {
          validatedRow.status = 'error';
          validatedRow.issues.push('Falta la cantidad de pases.');
        } else {
          const parsedGuests = parseInt(rawMaxGuests, 10);
          if (isNaN(parsedGuests)) {
            validatedRow.status = 'error';
            validatedRow.issues.push(`La cantidad de pases no es un número válido: "${rawMaxGuests}".`);
          } else if (parsedGuests <= 0) {
            validatedRow.status = 'error';
            validatedRow.issues.push(`Los pases deben ser mayores a 0 (recibido: ${parsedGuests}).`);
          } else {
            validatedRow.max_guests_numeric = parsedGuests;
          }
        }

        if (validatedRow.status === 'error') {
          errorsCount++;
        } else if (validatedRow.status === 'warning') {
          warningsCount++;
        }

        report.push(validatedRow);
      }

      setValidationReport(report);
      setImportStats({
        total: report.length,
        valid: report.length - errorsCount - warningsCount,
        warnings: warningsCount,
        errors: errorsCount
      });
      setImportStep('preview');

    } catch (err: any) {
      setImportError(err.message || 'Error desconocido al procesar e importar.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readAndProcessFile(file);
  };

  const readAndProcessFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processAndValidateData(text);
      }
    };
    reader.onerror = () => {
      setImportError('No se pudo leer el archivo seleccionado.');
    };
    reader.readAsText(file);
  };

  const executeImportUpload = async () => {
    setImportStep('uploading');
    setUploadProgress(10);
    setImportError(null);
    try {
      // 1. Delete all RSVPs
      const { error: rsvpDeleteError } = await supabase
        .from('rsvp')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (rsvpDeleteError) {
        throw new Error(`Error al limpiar los registros de RSVP: ${rsvpDeleteError.message}`);
      }
      setUploadProgress(30);

      // 2. Delete all invitations
      const { error: invDeleteError } = await supabase
        .from('invitations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (invDeleteError) {
        throw new Error(`Error al limpiar las invitaciones previas: ${invDeleteError.message}`);
      }
      setUploadProgress(50);

      // 3. Prepare inserts
      const insertRows = validationReport.map(row => ({
        code: row.code,
        group_name: row.group_name,
        max_guests: row.max_guests_numeric,
        custom_message: row.custom_message || ''
      }));

      // Chunk inserts in sizes of 50
      const chunkSize = 50;
      const totalChunks = Math.ceil(insertRows.length / chunkSize);
      
      for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
        const start = chunkIdx * chunkSize;
        const end = start + chunkSize;
        const chunk = insertRows.slice(start, end);

        const { error: insertError } = await supabase
          .from('invitations')
          .insert(chunk);

        if (insertError) {
          throw new Error(`Error al insertar lote ${chunkIdx + 1}: ${insertError.message}`);
        }

        const progressPercent = 50 + Math.round(((chunkIdx + 1) / totalChunks) * 50);
        setUploadProgress(progressPercent);
      }

      setImportStep('success');
      fetchData();

    } catch (err: any) {
      console.error('Error in executeImportUpload:', err);
      setImportError(err.message || 'Error al guardar los datos en Supabase.');
      setImportStep('preview');
      setIsOverwriteConfirmed(false);
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
            {activeTab !== 'special' && activeTab !== 'photos' && (
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
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'photos' ? 'border-primary text-primary' : 'border-transparent text-[#8a8d86] hover:text-[#2C3525]'}`}
          >
            Fotos de Invitados (Google Drive)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

              <div className="bg-white p-5 rounded-xl border border-[#D1C4B0]/40 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Pendientes de Envío (WhatsApp)</span>
                <div className="flex items-end justify-between mt-2">
                  {(() => {
                    const unsentInvs = invitations.filter(inv => !inv.whatsapp_sent_at);
                    const unsentCount = unsentInvs.length;
                    const unsentPeople = unsentInvs.reduce((sum, i) => sum + (i.max_guests || 0), 0);
                    return (
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-[#2C3525]">{unsentCount} {unsentCount === 1 ? 'sobre' : 'sobres'}</span>
                        <span className="text-xs font-medium text-[#8a8d86] mt-1">
                          {unsentPeople} {unsentPeople === 1 ? 'pase' : 'pases'} sin enviar
                        </span>
                      </div>
                    );
                  })()}
                  <Send className="h-4 w-4 text-slate-400 opacity-80 mb-1" />
                </div>
              </div>
            </div>

            {/* Quick Guide and CSV Template Download */}
            <div className="bg-white rounded-xl border border-[#D1C4B0]/40 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <h3 className="font-serif text-lg text-primary font-bold mb-2">Importación Masiva de Invitaciones</h3>
                <p className="text-xs text-[#44483f] leading-relaxed max-w-3xl">
                  Carga tus invitados en bloque utilizando nuestro importador integrado. Soporta la carga de archivos <strong>CSV, TSV y de texto</strong>, además del copiado y pegado directo de celdas desde Excel o Google Sheets. El sistema validará los datos y te alertará de cualquier error antes de aplicarlos.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <button
                  onClick={downloadCSVTemplate}
                  className="flex items-center justify-center gap-2 bg-white border border-[#D1C4B0] hover:bg-[#F2EFE9]/50 text-[#566247] px-4 py-2.5 rounded transition-colors text-xs font-semibold shadow-sm whitespace-nowrap"
                >
                  <Download className="h-4 w-4" />
                  Descargar Plantilla CSV
                </button>
                <button
                  onClick={() => {
                    setImportStep('input');
                    setPasteText('');
                    setSelectedFile(null);
                    setValidationReport([]);
                    setImportError(null);
                    setIsOverwriteConfirmed(false);
                    setOverwriteText('');
                    setIsImportModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-[#384c2b] text-white px-4 py-2.5 rounded transition-colors text-xs font-bold shadow-sm whitespace-nowrap"
                >
                  <Upload className="h-4 w-4" />
                  Importar Invitados
                </button>
              </div>
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
                <div className="flex items-center gap-3">
                  <div className="text-xs font-semibold text-[#566247] flex items-center bg-[#e7f2da] px-3 py-2 rounded border border-primary/5">
                    Total Registradas: {invitations.length} invitaciones
                  </div>
                  <button
                    onClick={() => {
                      setTempTemplateText(whatsappTemplate);
                      setIsTemplateModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-[#D1C4B0] text-primary px-3 py-2 rounded hover:bg-[#e7f2da]/30 transition-colors shadow-sm"
                  >
                    <MessageSquare size={13} className="text-primary" />
                    Editar mensaje
                  </button>
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

        {activeTab === 'photos' && (
          <div className="flex flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div className="bg-white p-5 rounded-xl border border-[#D1C4B0]/40 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Total de Fotos Recibidas</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-primary">
                    {photoUploads.reduce((sum, p) => sum + (p.photo_count || 0), 0)}
                  </span>
                  <ImageIcon className="h-5 w-5 text-primary opacity-80" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#D1C4B0]/40 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Invitados que Compartieron</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold text-[#C49550]">
                    {new Set(photoUploads.map(p => p.guest_name.toLowerCase().trim())).size}
                  </span>
                  <Users className="h-5 w-5 text-[#C49550] opacity-80" />
                </div>
              </div>
            </div>

            {/* Folder integration instructions & button */}
            <div className="bg-white rounded-xl border border-[#D1C4B0]/40 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <h3 className="font-serif text-lg text-primary font-bold mb-2">Carpeta Compartida de Google Drive</h3>
                <p className="text-xs text-[#44483f] leading-relaxed max-w-3xl">
                  Las fotos se guardan directamente en tu cuenta de Google Drive en la carpeta <strong>"Fotos Boda Harold y Anay"</strong>. Los archivos se nombran automáticamente con el nombre del invitado y la fecha para facilitar su clasificación.
                </p>
              </div>
              <a
                href="https://drive.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#e7f2da] hover:bg-[#d7e5c2] text-primary px-4 py-2.5 rounded font-semibold text-xs transition-colors shadow-sm self-start md:self-auto whitespace-nowrap"
              >
                <Download className="h-4 w-4" />
                Ir a mi Google Drive
              </a>
            </div>

            {/* Table wrapper */}
            <div className="bg-white rounded-xl border border-[#D1C4B0]/40 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#D1C4B0]/30 bg-[#FBFBFA] flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8d86] h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre del invitado..."
                    value={photoSearch}
                    onChange={e => setPhotoSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#D1C4B0] rounded focus:ring-0 focus:border-primary placeholder-[#c4c8bc] transition-colors"
                  />
                </div>
                <div className="text-xs font-semibold text-[#566247] flex items-center bg-[#e7f2da] px-3 py-2 rounded border border-primary/5">
                  Total Subidas: {photoUploads.length} lotes
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center text-[#8a8d86]">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                  Cargando trazabilidad de fotos...
                </div>
              ) : photoUploads.length === 0 ? (
                <div className="py-20 text-center text-[#8a8d86]">
                  Aún no se han registrado cargas de fotos de los invitados. Asegúrate de que los invitados escaneen el código QR del evento.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#FBFBFA] border-b border-[#D1C4B0]/30 text-xs font-semibold text-[#566247] uppercase tracking-wider">
                        <th className="p-4">Invitado</th>
                        <th className="p-4">Código de Invitación</th>
                        <th className="p-4 text-center">Fotos Aportadas</th>
                        <th className="p-4 text-right">Fecha / Hora de Carga</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D1C4B0]/20 text-[#44483f]">
                      {photoUploads
                        .filter(p => p.guest_name.toLowerCase().includes(photoSearch.toLowerCase()))
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-[#FDFDFD] transition-colors">
                            <td className="p-4 font-semibold text-[#2C3525]">
                              {p.guest_name}
                            </td>
                            <td className="p-4 font-mono text-xs">
                              {p.invitation_code || <span className="text-[#c4c8bc] italic">Acceso QR Directo</span>}
                            </td>
                            <td className="p-4 text-center">
                              <span className="bg-[#e7f2da] text-primary font-bold px-2.5 py-0.5 rounded text-xs">
                                +{p.photo_count} {p.photo_count === 1 ? 'foto' : 'fotos'}
                              </span>
                            </td>
                            <td className="p-4 text-right text-xs text-[#8a8d86] font-mono">
                              {new Date(p.created_at).toLocaleString('es-ES')}
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

      {/* Modal para editar plantilla de WhatsApp */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-[#D1C4B0] shadow-2xl max-w-lg w-full overflow-hidden text-left"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#D1C4B0]/20 bg-[#FBFBFA]">
                <h3 className="font-serif text-lg text-[#2C3525] font-bold">Editar mensaje de WhatsApp</h3>
                <p className="text-xs text-[#8a8d86] mt-1">Este mensaje se enviará al hacer clic en los enlaces de invitaciones.</p>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col gap-4">
                {isLocalSettingsMode && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2 leading-relaxed">
                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Modo Local / Demo:</strong> No se pudo conectar a la tabla de base de datos `settings`. Las modificaciones se guardarán temporalmente de forma local. Para persistir de forma permanente entre dispositivos, ejecuta el script SQL en Supabase.
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="templateText" className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Plantilla del mensaje</label>
                  <textarea
                    id="templateText"
                    rows={4}
                    value={tempTemplateText}
                    onChange={e => setTempTemplateText(e.target.value)}
                    placeholder="Escribe el mensaje aquí..."
                    className="w-full px-4 py-3 bg-[#FBFBFA] border border-[#D1C4B0] rounded-xl focus:ring-0 focus:border-primary placeholder-[#c4c8bc] text-sm text-[#2C3525] transition-colors resize-none"
                  />
                  <p className="text-[10px] text-[#8a8d86] italic">Nota: El enlace único de la invitación del invitado se añadirá automáticamente al final de este mensaje.</p>
                </div>

                {/* Live Preview */}
                <div className="flex flex-col gap-2 text-left">
                  <span className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">Vista previa en tiempo real</span>
                  <div className="bg-[#e7f2da]/30 border border-[#25D366]/20 rounded-xl p-4 text-xs text-[#2C3525] leading-relaxed relative font-medium">
                    <div className="absolute top-2 right-2 text-[10px] uppercase font-bold text-[#128C7E]/70 bg-[#25D366]/10 px-2 py-0.5 rounded">
                      Vista WhatsApp
                    </div>
                    <div className="whitespace-pre-wrap pr-16 text-left">
                      {tempTemplateText.trim()} <span className="text-primary font-mono select-none underline break-all">{window.location.origin}/CODIGO_INVITADO</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#D1C4B0]/20 bg-[#FBFBFA] flex justify-end gap-3">
                <button
                  onClick={() => setIsTemplateModalOpen(false)}
                  disabled={savingTemplate}
                  className="px-4 py-2 text-xs font-semibold text-[#566247] hover:bg-[#F2EFE9]/50 rounded-xl transition-colors border border-transparent hover:border-[#D1C4B0]/40 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveWhatsappTemplate}
                  disabled={savingTemplate || tempTemplateText.trim().length === 0}
                  className="bg-primary hover:bg-[#384c2b] text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingTemplate && <RefreshCw size={12} className="animate-spin" />}
                  {savingTemplate ? 'Guardando...' : 'Guardar plantilla'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-[#D1C4B0] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-left"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#D1C4B0]/20 bg-[#FBFBFA] flex justify-between items-center flex-shrink-0">
                <div>
                  <h3 className="font-serif text-lg text-[#2C3525] font-bold">Importación Masiva de Invitados</h3>
                  <p className="text-xs text-[#8a8d86] mt-1">Carga tu lista y valida las restricciones de formato antes de guardarla.</p>
                </div>
                {importStep !== 'uploading' && (
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-[#F2EFE9] text-[#8a8d86] transition-colors"
                  >
                    <XCircle size={20} />
                  </button>
                )}
              </div>

              {/* Error Alert Bar */}
              {importError && (
                <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{importError}</span>
                </div>
              )}

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-6 min-h-0">
                {importStep === 'input' && (
                  <div className="flex flex-col gap-5">
                    {/* Method Selector Tabs */}
                    <div className="flex border-b border-[#D1C4B0]/20 gap-4">
                      <button
                        onClick={() => { setImportTab('paste'); setImportError(null); }}
                        className={`pb-2 text-xs font-bold border-b-2 transition-colors ${importTab === 'paste' ? 'border-primary text-primary' : 'border-transparent text-[#8a8d86]'}`}
                      >
                        Copiar y Pegar desde Excel
                      </button>
                      <button
                        onClick={() => { setImportTab('file'); setImportError(null); }}
                        className={`pb-2 text-xs font-bold border-b-2 transition-colors ${importTab === 'file' ? 'border-primary text-primary' : 'border-transparent text-[#8a8d86]'}`}
                      >
                        Subir Archivo (.csv, .tsv, .txt)
                      </button>
                    </div>

                    {importTab === 'paste' ? (
                      <div className="flex flex-col gap-2">
                        <label htmlFor="paste-input" className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">
                          Pega tus filas aquí (incluyendo la fila de encabezados):
                        </label>
                        <textarea
                          id="paste-input"
                          rows={10}
                          value={pasteText}
                          onChange={e => setPasteText(e.target.value)}
                          placeholder="code&#9;group_name&#9;max_guests&#9;custom_message&#10;3001234567&#9;Familia Pérez y Acompañante&#9;2&#9;Queridos tíos, esperamos contar con ustedes.&#10;3107654321&#9;Juan Gómez&#9;1&#9;Juan, te esperamos en nuestro gran día."
                          className="w-full px-4 py-3 bg-[#FBFBFA] border border-[#D1C4B0] rounded-xl focus:ring-0 focus:border-primary placeholder-[#c4c8bc] text-xs font-mono transition-colors resize-y leading-relaxed"
                        />
                        <p className="text-[10px] text-[#8a8d86] leading-relaxed">
                          * Copia directamente las celdas de tu hoja de cálculo (Excel, Google Sheets) y pégalas arriba. Los tabuladores se detectarán automáticamente y se procesará el formato.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <label className="text-xs font-semibold text-[#8a8d86] uppercase tracking-wider">
                          Selecciona o arrastra tu archivo:
                        </label>
                        <div
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) readAndProcessFile(file);
                          }}
                          className="border-2 border-dashed border-[#D1C4B0] hover:border-primary bg-[#FBFBFA] hover:bg-[#e7f2da]/10 transition-colors rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer relative"
                        >
                          <input
                            type="file"
                            accept=".csv,.tsv,.txt"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <Upload className="h-10 w-10 text-primary opacity-60 mb-3" />
                          <span className="text-sm font-semibold text-[#2C3525] mb-1">
                            {selectedFile ? selectedFile.name : 'Haz clic para seleccionar o arrastra un archivo'}
                          </span>
                          <span className="text-xs text-[#8a8d86]">
                            Soporta CSV delimitado por comas o punto y coma, y archivos de texto (.txt) tabulados.
                          </span>
                        </div>
                        {selectedFile && (
                          <div className="bg-[#e7f2da]/30 border border-primary/10 rounded-xl p-3.5 flex justify-between items-center text-xs">
                            <span className="font-semibold text-primary">Archivo cargado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                            <button
                              onClick={() => { setSelectedFile(null); setValidationReport([]); }}
                              className="text-red-600 hover:text-red-700 font-semibold"
                            >
                              Quitar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {importStep === 'preview' && (
                  <div className="flex flex-col gap-6 h-full min-h-0">
                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-shrink-0">
                      <div className="bg-[#FBFBFA] border border-[#D1C4B0]/40 p-4 rounded-xl flex flex-col">
                        <span className="text-[10px] font-bold text-[#8a8d86] uppercase tracking-wider">Total Filas</span>
                        <span className="text-xl font-bold text-[#2C3525] mt-1">{importStats.total}</span>
                      </div>
                      <div className="bg-[#e7f2da]/40 border border-primary/20 p-4 rounded-xl flex flex-col">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Correctas</span>
                        <span className="text-xl font-bold text-primary mt-1">{importStats.valid}</span>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex flex-col">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Advertencias</span>
                        <span className="text-xl font-bold text-amber-600 mt-1">{importStats.warnings}</span>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex flex-col">
                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Errores</span>
                        <span className="text-xl font-bold text-red-600 mt-1">{importStats.errors}</span>
                      </div>
                    </div>

                    {/* Mappings Info Box */}
                    <div className="bg-[#e7f2da]/20 border border-primary/10 rounded-xl p-4 text-xs flex flex-wrap gap-x-6 gap-y-2 flex-shrink-0">
                      <span className="font-semibold text-primary">Mapeo detectado:</span>
                      <span><strong>Celular/Código:</strong> <code className="bg-white border px-1 rounded">{headerMapping.code}</code></span>
                      <span><strong>Nombre/Sobre:</strong> <code className="bg-white border px-1 rounded">{headerMapping.group_name}</code></span>
                      <span><strong>Pases:</strong> <code className="bg-white border px-1 rounded">{headerMapping.max_guests}</code></span>
                      <span><strong>Mensaje:</strong> <code className="bg-white border px-1 rounded">{headerMapping.custom_message}</code></span>
                    </div>

                    {/* Preview Table with Search */}
                    <div className="flex-1 flex flex-col min-h-0 bg-[#FBFBFA] border border-[#D1C4B0]/40 rounded-xl overflow-hidden">
                      <div className="p-3 border-b border-[#D1C4B0]/30 bg-white flex-shrink-0 flex items-center justify-between gap-4">
                        <span className="text-xs font-bold text-[#566247]">Vista Previa de Validación</span>
                        <div className="relative w-48 sm:w-64">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a8d86] h-3.5 w-3.5" />
                          <input
                            type="text"
                            placeholder="Buscar en la vista previa..."
                            value={importSearch}
                            onChange={e => setImportSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FBFBFA] border border-[#D1C4B0] rounded-lg focus:ring-0 focus:border-primary placeholder-[#c4c8bc] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex-1 overflow-auto min-h-0">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-[#FBFBFA] border-b border-[#D1C4B0]/20 text-[10px] font-bold text-[#566247] uppercase tracking-wider sticky top-0 z-10">
                            <tr>
                              <th className="p-3 w-12 text-center bg-[#FBFBFA]">Fila</th>
                              <th className="p-3 w-28 bg-[#FBFBFA]">Código/Celular</th>
                              <th className="p-3 w-40 bg-[#FBFBFA]">Nombre/Sobre</th>
                              <th className="p-3 w-16 text-center bg-[#FBFBFA]">Pases</th>
                              <th className="p-3 bg-[#FBFBFA]">Mensaje Personalizado</th>
                              <th className="p-3 w-32 bg-[#FBFBFA]">Estado / Detalles</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#D1C4B0]/20 bg-white text-[#44483f]">
                            {validationReport
                              .filter(row => {
                                const term = importSearch.toLowerCase();
                                return (
                                  row.code.toLowerCase().includes(term) ||
                                  row.group_name.toLowerCase().includes(term) ||
                                  row.custom_message.toLowerCase().includes(term) ||
                                  row.issues.some((issue: string) => issue.toLowerCase().includes(term))
                                );
                              })
                              .map((row) => (
                                <tr key={row.rowIndex} className="hover:bg-[#FDFDFD] transition-colors">
                                  <td className="p-3 text-center text-[#8a8d86] font-mono">{row.rowIndex}</td>
                                  <td className="p-3 font-mono font-semibold text-[#2C3525]">{row.code || <span className="text-red-500 italic">Vacío</span>}</td>
                                  <td className="p-3 font-semibold text-[#2C3525]">{row.group_name || <span className="text-red-500 italic">Vacío</span>}</td>
                                  <td className="p-3 text-center font-bold">{row.max_guests}</td>
                                  <td className="p-3 text-[#8a8d86] max-w-[200px] truncate" title={row.custom_message}>{row.custom_message || <span className="text-stone-300 italic">-</span>}</td>
                                  <td className="p-3">
                                    <div className="flex items-start gap-1.5">
                                      {row.status === 'success' && (
                                        <span className="flex items-center gap-1 text-primary font-bold">
                                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                          Válido
                                        </span>
                                      )}
                                      {row.status === 'warning' && (
                                        <div className="flex flex-col gap-0.5 text-amber-600">
                                          <span className="flex items-center gap-1 font-bold">
                                            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                            Advertencia
                                          </span>
                                          <span className="text-[10px] leading-tight font-medium text-stone-600">{row.issues.join(' ')}</span>
                                        </div>
                                      )}
                                      {row.status === 'error' && (
                                        <div className="flex flex-col gap-0.5 text-red-600">
                                          <span className="flex items-center gap-1 font-bold">
                                            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                            Error
                                          </span>
                                          <span className="text-[10px] leading-tight font-medium text-stone-600">{row.issues.join(' ')}</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {importStep === 'uploading' && (
                  <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
                    <RefreshCw className="h-12 w-12 animate-spin text-primary opacity-80" />
                    <h4 className="font-serif text-lg text-primary font-bold">Procesando Importación...</h4>
                    <p className="text-xs text-[#8a8d86] max-w-sm">
                      Limpiando base de datos previa y subiendo las nuevas invitaciones en bloques optimizados.
                    </p>
                    <div className="w-full max-w-xs bg-stone-100 rounded-full h-2 mt-2 overflow-hidden border">
                      <div
                        className="bg-primary h-full transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-[#44483f] font-bold">{uploadProgress}% Completado</span>
                  </div>
                )}

                {importStep === 'success' && (
                  <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
                    <div className="h-16 w-16 bg-[#e7f2da] rounded-full flex items-center justify-center text-primary mb-2 shadow-inner">
                      <CheckCircle className="h-10 w-10 text-primary" />
                    </div>
                    <h4 className="font-serif text-2xl text-primary font-bold">¡Carga Exitosa!</h4>
                    <p className="text-xs text-[#44483f] max-w-md leading-relaxed">
                      Se han importado exitosamente las <strong>{validationReport.length}</strong> invitaciones en la base de datos de Supabase. El panel se actualizará automáticamente.
                    </p>
                  </div>
                )}
              </div>

              {/* Overwrite Confirmation Overlay */}
              {isOverwriteConfirmed && importStep === 'preview' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-20">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl border border-red-200 shadow-2xl p-6 max-w-md w-full text-center"
                  >
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                    <h4 className="font-serif text-lg text-[#2C3525] font-bold mb-2">¿Confirmar Sobrescribir Base de Datos?</h4>
                    <p className="text-xs text-[#44483f] leading-relaxed mb-4">
                      Esta operación es irreversible. Al continuar, se <strong>borrarán permanentemente</strong> todas las invitaciones y los RSVPs/confirmaciones actuales en Supabase.
                    </p>
                    <div className="flex flex-col gap-2 text-left mb-5">
                      <label htmlFor="confirm-phrase" className="text-[10px] font-bold text-[#8a8d86] uppercase tracking-wider">
                        Escribe <span className="text-red-600 font-bold select-all">SOBRESCRIBIR</span> para autorizar:
                      </label>
                      <input
                        id="confirm-phrase"
                        type="text"
                        value={overwriteText}
                        onChange={e => setOverwriteText(e.target.value)}
                        placeholder="Escribe la palabra de confirmación"
                        className="w-full px-3 py-2 text-xs bg-[#FBFBFA] border border-red-200 rounded-lg focus:ring-0 focus:border-red-500 font-bold text-center uppercase text-red-700 tracking-wider animate-pulse"
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => { setIsOverwriteConfirmed(false); setOverwriteText(''); }}
                        className="flex-1 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-semibold text-[#566247] transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={executeImportUpload}
                        disabled={overwriteText.trim().toUpperCase() !== 'SOBRESCRIBIR'}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
                      >
                        Confirmar y Borrar
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Footer */}
              <div className="p-6 border-t border-[#D1C4B0]/20 bg-[#FBFBFA] flex justify-end gap-3 flex-shrink-0">
                {importStep === 'input' && (
                  <>
                    <button
                      onClick={() => setIsImportModalOpen(false)}
                      className="px-5 py-2 text-xs font-semibold text-[#566247] hover:bg-[#F2EFE9]/50 rounded-xl transition-colors border border-transparent hover:border-[#D1C4B0]/40"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={() => {
                        if (importTab === 'paste') {
                          if (pasteText.trim().length === 0) {
                            setImportError('Por favor pega el contenido de tus celdas.');
                            return;
                          }
                          processAndValidateData(pasteText);
                        }
                      }}
                      disabled={importTab === 'file' && !selectedFile}
                      className="bg-primary hover:bg-[#384c2b] text-white px-6 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                    >
                      Validar Datos
                    </button>
                  </>
                )}

                {importStep === 'preview' && (
                  <>
                    <button
                      onClick={() => {
                        setImportStep('input');
                        setImportError(null);
                        setSelectedFile(null);
                      }}
                      className="px-5 py-2 text-xs font-semibold text-[#566247] hover:bg-[#F2EFE9]/50 rounded-xl transition-colors border border-transparent hover:border-[#D1C4B0]/40"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={() => setIsOverwriteConfirmed(true)}
                      disabled={importStats.errors > 0}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                    >
                      Confirmar y Subir ({importStats.total} filas)
                    </button>
                  </>
                )}

                {importStep === 'success' && (
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="bg-primary hover:bg-[#384c2b] text-white px-6 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Terminar
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
